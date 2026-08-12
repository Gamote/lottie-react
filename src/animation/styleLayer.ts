/**
 * The cascade layer every library stylesheet is wrapped in.
 *
 * The wrapper exists for consumers whose own CSS lives in cascade layers,
 * Tailwind 4 being the common case. Unlayered rules outrank all layered rules,
 * so without a layer of our own even a zero-specificity default beats every
 * utility class. Inside a layer, the defaults can be ranked below the
 * consumer's layers with one declaration written before their own styles load:
 *
 * ```css
 * @layer lottie-react;
 * ```
 *
 * A consumer whose CSS is unlayered needs nothing: unlayered rules beat
 * layered ones, so their styles keep winning as before.
 *
 * Named after the package, like the style precedence, because a name a
 * consumer already associates with the library cannot collide with a layer
 * ladder of their own.
 */
export const styleLayer = "lottie-react";
