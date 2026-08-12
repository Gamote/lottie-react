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
export const lottieErrorClass = "lottie-error";

/**
 * What it says when nobody has said otherwise.
 *
 * A sentence written for whoever is looking at the page rather than for whoever
 * wrote it: the reason itself is on the animation as `error`, and it describes
 * a path or a payload, which is a developer's problem and not a reader's.
 * Anything else, in any language, is passed as children.
 */
const defaultMessage = "The animation could not be loaded.";

/**
 * The overlay's own defaults, at zero specificity and inside the library's
 * cascade layer, so that any rule the consumer
 * writes beats them per property.
 *
 * There is nothing here beyond the shared positioning. It appears immediately,
 * unlike the loading overlay, which waits: waiting exists so that a load
 * finishing quickly is never announced, and a failure has already finished.
 */
export const lottieErrorStyles = overlayStyles(lottieErrorClass);

/** What this component owns. Every other prop belongs to the element. */
interface LottieErrorOwnProps {
  /** The animation to watch. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** What to show when it fails. A short sentence unless you say otherwise. */
  children?: ReactNode;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieError} accepts. */
export type LottieErrorProps = FixedElementProps<LottieErrorOwnProps, "div">;

/**
 * What to show when the animation could not be loaded.
 *
 * Render it among the children of a component that publishes an animation, or
 * anywhere at all with the result of `useLottie`. It covers the box it sits in
 * once a load has failed and renders nothing the rest of the time.
 *
 * ```jsx
 * <Lottie src="/hero.json">
 *   <LottieDisplay />
 *   <LottieError />
 * </Lottie>
 * ```
 *
 * The reason is on the animation as `error`, and `reload()` is what tries
 * again, so a button of your own passed as children can offer both.
 *
 * It takes every attribute of the `div` it renders, and `ref` names that same
 * element. Its own rules are all zero-specificity, so any of them can be
 * replaced one property at a time from your own stylesheet. If your CSS lives
 * in cascade layers, declare `@layer lottie-react;` before your own styles so
 * the library's layer ranks below them.
 */
export const LottieError = forwardRef<HTMLDivElement, LottieErrorProps>(
  function LottieError({ lottie, className, children, ...rest }, ref) {
    const { state } = useLottieInstance(lottie);

    if (state !== LottieState.error) {
      return null;
    }

    return renderStyledElement({
      tag: "div",
      styleClass: lottieErrorClass,
      styles: lottieErrorStyles,
      className,
      /* Before the spread, so a consumer's own role replaces it. */
      attributes: { role: "alert", ...rest },
      ref,
      children: children ?? defaultMessage,
    });
  },
);
