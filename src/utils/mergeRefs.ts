import type { Ref, RefCallback } from "react";

/**
 * Sends one element to several refs.
 *
 * An element has a single `ref` slot, so any element that both this library and
 * the person using it want a handle on needs one callback that feeds both.
 *
 * Teardown is the part that is not boilerplate, because the two supported React
 * versions differ. React 19 treats a function returned from a ref callback as
 * its cleanup and then never calls that ref with `null`, while React 18
 * discards the return and calls with `null`. So each ref gets its own cleanup
 * where it returned one and a `null` call where it did not, and the combined
 * teardown is returned for React 19 to run. React 18 ignores it and calls this
 * callback with `null` instead, which does the same work.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const teardowns = refs.map((ref) => {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return typeof cleanup === "function" ? cleanup : () => ref(null);
      }

      if (ref) {
        ref.current = node;
        return () => {
          ref.current = null;
        };
      }

      return () => undefined;
    });

    return () => {
      for (const teardown of teardowns) {
        teardown();
      }
    };
  };
}
