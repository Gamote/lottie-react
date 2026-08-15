function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Whether a parsed animation carries an expression anywhere in it.
 *
 * An expression is a non-empty string under the key `x` on an animatable
 * property, which is also how the engine finds them. The type of the value is
 * what decides, not the key: inside keyframes `x` names the numeric easing
 * handles, and on a mask it names the expansion property, an object which may
 * itself carry an expression one level down. The walk covers objects and
 * arrays across the whole document rather than `layers` alone, because a
 * precomp's layers live under `assets`, and it stops at the first find. It
 * assumes the tree shape parsed JSON always has: an object that referenced
 * itself would recurse without end.
 */
export function hasExpressions(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasExpressions);
  }
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.x === "string" && value.x !== "") {
    return true;
  }
  return Object.values(value).some(hasExpressions);
}
