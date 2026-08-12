import { useState } from "react";
import { isSameJson } from "./isSameJson.js";

/**
 * Keeps a value stable until its **content** changes, so it can be depended on.
 *
 * A value written inline at a call site is a new value on every render, and an
 * effect that depends on it therefore re-runs on every render. Where that
 * effect also sets state, the component re-renders, the value is built again,
 * and it never settles.
 *
 * The reference is compared first, so a caller who passes something they
 * already hold pays nothing at all. Only a caller who rebuilds an equal value
 * pays for the comparison, which is exactly the case being rescued.
 *
 * Assigning state during render is React's own answer to adjusting state when a
 * prop changes: the component renders again immediately, before anything is
 * committed, so the intermediate result is never seen.
 */
export function useStableValue<Value>(value: Value): Value {
  const [stable, setStable] = useState(value);

  if (stable !== value && !isSameJson(stable, value)) {
    setStable(value);
  }

  return stable;
}
