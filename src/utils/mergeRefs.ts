import type { Ref, RefCallback } from "react";

/**
 * Sends one element to several refs.
 *
 * An element has a single `ref` slot, so any element that both this library and
 * the person using it want a handle on needs one callback that feeds both.
 *
 * Teardown is where the two supported React versions differ. React 19 treats a
 * function returned from a ref callback as its cleanup and never calls that ref
 * with `null`; React 18 always calls with `null` and, in development, reports a
 * returned function. So a combined teardown is returned only when a ref returned
 * a cleanup of its own, since that ref must be torn down by it rather than by a
 * `null` call. Otherwise nothing is returned and both versions call this
 * callback with `null`, which clears every ref.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    let returned = false;
    const teardowns = refs.map((ref) => {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        if (typeof cleanup === "function") {
          returned = true;
          return cleanup;
        }
        return () => ref(null);
      }

      if (ref) {
        ref.current = node;
        return () => {
          ref.current = null;
        };
      }

      return () => undefined;
    });

    if (!returned) {
      return undefined;
    }

    return () => {
      for (const teardown of teardowns) {
        teardown();
      }
    };
  };
}
