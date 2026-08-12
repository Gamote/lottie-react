/** Narrows without a cast: any array can be read as a list of unknowns. */
function isJsonArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** Narrows without a cast: any plain object can be read as unknown-valued. */
function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Compares two JSON values by content: objects, arrays, and the primitives JSON
 * can hold. Key order does not matter, and `NaN` equals itself.
 *
 * Deliberately narrower than a general deep-equality function. It has no
 * understanding of `Map`, `Set`, `Date`, `RegExp` or typed arrays, and treating
 * one as a plain object would report two different values as the same. Animation
 * data is parsed JSON, so none of them can appear in it.
 *
 * It recurses, so a value that refers to itself overflows the stack rather than
 * returning. JSON cannot express one.
 */
export function isSameJson(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (isJsonArray(a)) {
    if (!isJsonArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => isSameJson(item, b[index]));
  }

  if (isJsonObject(a)) {
    if (!isJsonObject(b)) {
      return false;
    }
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) {
      return false;
    }
    return keys.every(
      (key) => Object.hasOwn(b, key) && isSameJson(a[key], b[key]),
    );
  }

  return false;
}
