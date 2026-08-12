import { forwardRef, type ReactNode } from "react";
import { renderStyledElement } from "../animation/renderStyledElement.js";
import {
  type FixedElementProps,
  type LottieInstance,
  LottieState,
} from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import { overlayStyles } from "./overlayStyles.js";

/**
 * The class the overlay carries, and the name React deduplicates its stylesheet
 * by. One string does both, so two components can only collide in the document
 * if they already collide in CSS.
 */
export const lottieLoadingClass = "lottie-loading";

/** The class the built-in indicator carries. */
const spinnerClass = "lottie-spinner";

/*
 * The keyframes names. A keyframes name is global to the document, which is
 * the one thing `:where()` scoping cannot contain, so each carries the
 * library's prefix.
 */
const spinKeyframes = "lottie-spin";
const loadingInKeyframes = "lottie-loading-in";

/** The two knobs a consumer's stylesheet can set. `showAfter` writes the first. */
const delayProperty = "--lottie-loading-delay";
const fadeProperty = "--lottie-loading-fade";

/**
 * The overlay's own defaults, at zero specificity and inside the library's
 * cascade layer, so that any rule the consumer
 * writes beats them per property.
 *
 * The indicator is drawn in `currentColor` and sized in `em`, so it takes the
 * surrounding text's colour and size rather than any this library picked.
 *
 * Three of these are load-bearing.
 *
 * The wait is expressed as a fade **in** from a keyframe, never as a hidden
 * element the animation reveals. The two look equivalent and are not: with the
 * element hidden by its own rule, anything that switches the animation off
 * leaves it hidden for good, while written this way the same switch shows it
 * immediately, which is the right way round for an indicator.
 *
 * Both durations read a custom property with the default in the fallback, which
 * is what lets a stylesheet change either one, at any level from the element to
 * the document. `showAfter` sets the same property, so the prop and the CSS are
 * one mechanism rather than two that can disagree.
 *
 * Under a reduced-motion preference the indicator is **slowed rather than
 * stopped**, because the preference asks for less motion and a stationary
 * indicator no longer says the page is working.
 */
export const lottieLoadingStyles = `${overlayStyles(lottieLoadingClass)}:where(.${lottieLoadingClass}) > :where(.${spinnerClass}){box-sizing:border-box;width:2em;height:2em;border:0.15em solid currentColor;border-top-color:transparent;border-radius:50%;animation-name:${spinKeyframes};animation-duration:0.8s;animation-timing-function:linear;animation-iteration-count:infinite}:where(.${lottieLoadingClass}){animation-name:${loadingInKeyframes};animation-duration:var(${fadeProperty},150ms);animation-delay:var(${delayProperty},400ms);animation-fill-mode:both}@media (prefers-reduced-motion:reduce){:where(.${lottieLoadingClass}) > :where(.${spinnerClass}){animation-duration:1.6s}}@keyframes ${spinKeyframes}{to{transform:rotate(360deg)}}@keyframes ${loadingInKeyframes}{from{opacity:0}}`;

/** What this component owns. Every other prop belongs to the element. */
interface LottieLoadingOwnProps {
  /** The animation to watch. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** What to show while it loads. A turning indicator unless you say otherwise. */
  children?: ReactNode;
  /** Added to the library's class rather than replacing it. */
  className?: string;
  /**
   * How long to wait before appearing, in milliseconds.
   *
   * An animation that arrives sooner is never covered at all, which is what
   * stops a fast load showing an indicator nobody can read. Setting `0` shows
   * it at once.
   */
  showAfter?: number;
}

/** What {@link LottieLoading} accepts. */
export type LottieLoadingProps = FixedElementProps<
  LottieLoadingOwnProps,
  "div"
>;

/**
 * What to show while the animation loads.
 *
 * Render it among the children of a component that publishes an animation, or
 * anywhere at all with the result of `useLottie`. It covers the box it sits in
 * while the animation is loading and renders nothing the rest of the time.
 *
 * ```jsx
 * <Lottie src="/hero.json">
 *   <LottieDisplay />
 *   <LottieLoading />
 * </Lottie>
 * ```
 *
 * It takes every attribute of the `div` it renders, and `ref` names that same
 * element. Its own rules are all zero-specificity, so any of them can be
 * replaced one property at a time from your own stylesheet. If your CSS lives
 * in cascade layers, declare `@layer lottie-react;` before your own styles so
 * the library's layer ranks below them.
 */
export const LottieLoading = forwardRef<HTMLDivElement, LottieLoadingProps>(
  function LottieLoading(
    { lottie, className, children, showAfter, style, ...rest },
    ref,
  ) {
    const { state } = useLottieInstance(lottie);

    if (state !== LottieState.loading) {
      return null;
    }

    return renderStyledElement({
      tag: "div",
      styleClass: lottieLoadingClass,
      styles: lottieLoadingStyles,
      className,
      /*
       * The role is placed before the spread and the style after it, which is
       * what makes both the consumer's: their `role` replaces ours, and their
       * `style` wins over the one `showAfter` writes.
       */
      attributes: {
        role: "status",
        ...rest,
        style:
          showAfter === undefined
            ? style
            : { [delayProperty]: `${String(showAfter)}ms`, ...style },
      },
      ref,
      children: children ?? <div className={spinnerClass} />,
    });
  },
);
