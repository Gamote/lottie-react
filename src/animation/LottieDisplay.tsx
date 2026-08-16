"use client";

import { type Ref, useMemo } from "react";
import { mergeRefs } from "../utils/mergeRefs.js";
import { polymorphicForwardRef } from "./polymorphicForwardRef.js";
import { renderStyledElement } from "./renderStyledElement.js";
import type {
  AnyTag,
  ElementProps,
  LottieInstance,
  LottieRenderer,
} from "./types.js";
import { useLottieInstance } from "./useLottieInstance.js";

/**
 * The class the display carries, and the name React deduplicates its stylesheet
 * by. One string does both, so two components can only collide in the document
 * if they already collide in CSS.
 */
export const lottieDisplayClass = "lottie-display";

/**
 * The display's own defaults, at zero specificity and inside the library's
 * cascade layer, so that any rule the consumer writes beats them per property.
 *
 * Two of these are required rather than chosen. `position` is what the html
 * renderer needs, because the box it appends is absolutely positioned, and it
 * is what the overlays anchor to. `padding` is a correctness fix: the canvas
 * renderer sizes its bitmap from `offsetWidth`, which includes padding, so a
 * padded display draws at the wrong scale.
 *
 * Every selector stays scoped to the class. An unscoped one would restyle the
 * host page's own elements.
 */
export const lottieDisplayStyles = `:where(.${lottieDisplayClass}){width:100%;height:100%;position:relative;overflow:hidden;border:0;padding:0;background:none;appearance:none}`;

/** What this component owns. Every other prop belongs to the element. */
interface LottieDisplayOwnProps {
  /** The animation to draw. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Which element to render. A `div` unless you say otherwise. */
  as?: unknown;
  /**
   * Never any: lottie-web owns what is inside the display and rebuilds it on
   * every load, so anything React put there would be wiped without warning.
   */
  children?: never;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/**
 * What {@link LottieDisplay} accepts for a given element.
 *
 * `as` is checked against the case every renderer allows, an element that may
 * hold the `<svg>` or `<canvas>` two of the three append, because the display
 * takes an animation rather than a source and so cannot see which renderer is
 * in use. With `renderer="html"` a block element is required and nothing here
 * can enforce it.
 */
export type LottieDisplayProps<As extends AnyTag = "div"> = ElementProps<
  LottieDisplayOwnProps,
  As,
  undefined,
  typeof LottieRenderer.svg
>;

/**
 * The element the animation is drawn inside.
 *
 * Render it among the children of a component that publishes an animation to
 * say where the animation goes, or on its own with the result of `useLottie` to
 * place it anywhere at all. It takes every attribute of the element it renders,
 * and `ref` names that same element.
 *
 * ```jsx
 * const lottie = useLottie({ src });
 * <LottieDisplay lottie={lottie} as="section" className="h-64" />
 * ```
 */
export const LottieDisplay = polymorphicForwardRef(function LottieDisplay<
  As extends AnyTag = "div",
>(
  { lottie, as, className, ...rest }: LottieDisplayProps<As>,
  ref: Ref<HTMLElement>,
) {
  const instance = useLottieInstance(lottie);
  const { setDisplayRef } = instance;

  /*
   * Rebuilding this every render would make React detach and reattach the
   * element, handing the animation its container again on every unrelated
   * render of the page around it.
   */
  const attach = useMemo(
    () => mergeRefs(ref, setDisplayRef),
    [ref, setDisplayRef],
  );

  /*
   * `as` carries a rejection type rather than a tag when the tag is refused,
   * which is what puts a readable message on the prop at the call site. Asking
   * whether it is a string is what tells the two apart.
   */
  return renderStyledElement({
    tag: typeof as === "string" ? as : "div",
    styleClass: lottieDisplayClass,
    styles: lottieDisplayStyles,
    className,
    attributes: rest,
    ref: attach,
  });
});
