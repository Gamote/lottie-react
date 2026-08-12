/** What lottie-web needs in order to find the animation. */
type NormalizedSource = { path: string } | { animationData: object };

/**
 * Turns the `src` prop into the pair of fields lottie-web understands, or
 * `null` when it is not something an animation could be loaded from.
 *
 * A non-empty string is a URL or path that the engine fetches and parses as
 * JSON. A `.lottie` archive is **not** supported: it is a zip, and nothing here
 * or in lottie-web unpacks one.
 *
 * An object is the parsed animation itself, and it is **always** shallow-copied
 * before the engine sees it. lottie-web writes `__complete` onto whatever it is
 * handed, so a frozen object throws `TypeError: Cannot add property __complete`
 * and takes the whole load down with it. That happens with `import * as data
 * from "./animation.json"` under Node's own JSON modules, whose namespace is
 * not extensible.
 *
 * The copy is unconditional rather than guarded by `Object.isExtensible`,
 * because the shape of that namespace object differs by toolchain: Node's is
 * not extensible while a bundler's usually is. A guard would therefore behave
 * differently depending on who built the consumer's application, and a copy
 * behaves the same everywhere. It costs about 70 nanoseconds and does not grow
 * with the animation, since only the top level is copied.
 *
 * The copy does not protect the objects inside `layers`, which the engine
 * annotates in place. That is harmless, because those writes are idempotent
 * flags, and avoiding it would mean deep-copying the entire animation on every
 * load.
 */
export function normalizeAnimationSource(
  source: unknown,
): NormalizedSource | null {
  if (typeof source === "string") {
    const path = source.trim();
    return path.length > 0 ? { path } : null;
  }

  if (typeof source === "object" && source !== null && !Array.isArray(source)) {
    return { animationData: { ...source } };
  }

  return null;
}
