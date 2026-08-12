/**
 * How React ranks every stylesheet this library renders.
 *
 * One value for all of them, so they sit together in a block a consumer can
 * rank their own CSS against as a unit. It names the package rather than a
 * position, because React treats a precedence it meets first as lower, so a
 * position would only be right by accident of render order.
 */
export const stylePrecedence = "lottie-react";
