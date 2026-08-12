/**
 * The rules that put an overlay over the animation, scoped to the class it is
 * given.
 *
 * Both overlays cover the same box in the same way, and each still ships its
 * own copy under its own name, because the class and the stylesheet's `href`
 * are one string. Sharing the class instead would mean two names on one element
 * and a second stylesheet to order against the first.
 *
 * The overlay anchors to whichever ancestor is positioned, which is the element
 * `<Lottie>` renders around its children.
 *
 * Three details are not free choices. The four edges are written out rather than
 * as `inset`, because the test environment does not expand that shorthand, so a
 * rule written with it could never be shown to apply. And `z-index` is what
 * decides the overlay wins against the animation whichever order the two are
 * written in, since without it a display rendered afterwards paints on top.
 *
 * The third is the background. An overlay spans everything the animation's box
 * holds, the control bar included, so with no background of its own the buttons
 * and the seek bar read straight through the message it is there to show. It is
 * mixed from `Canvas`, the system colour for page background, rather than from
 * `currentColor`, because a scrim has to move towards the surface behind it and
 * `currentColor` is the text, which would lighten the overlay on a dark page and
 * darken it on a light one. Partly transparent, so what is underneath stays
 * visible as context rather than disappearing.
 */
export function overlayStyles(styleClass: string): string {
  return `:where(.${styleClass}){position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,Canvas 80%,transparent)}`;
}
