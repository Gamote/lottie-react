import type { FixedElementProps } from "../animation/types.js";
import { controlIcon } from "./controlIcon.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieFullscreenClass = "lottie-fullscreen";

const enterPath =
  "M7 14H5v5h5v-2H7zM5 10h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z";
const exitPath =
  "M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z";

/** What this component owns. Every other prop belongs to the element. */
interface LottieFullscreenButtonOwnProps {
  /** Whether the animation is the thing currently filling the screen. */
  isFullscreen: boolean;
  /** Fills the screen with the animation, or gives the screen back. */
  toggle: () => void;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieFullscreenButton} accepts. */
export type LottieFullscreenButtonProps = FixedElementProps<
  LottieFullscreenButtonOwnProps,
  "button"
>;

/**
 * Fills the screen with the animation and everything around it.
 *
 * The only control that is handed its state rather than reading the animation,
 * because what it needs is a property of an element and of the browser rather
 * than of the animation, and because the bar needs the same toggle for the `f`
 * key. Two copies of one piece of state derived from one event is how they
 * would drift.
 *
 * The label says what pressing it will do and changes with the icon, the way
 * play and pause do in this bar, rather than naming a control whose state is
 * carried separately. That is also what every video player does here.
 */
export function LottieFullscreenButton({
  isFullscreen,
  toggle,
  className,
  ...rest
}: LottieFullscreenButtonProps) {
  const label = isFullscreen ? "Exit full screen" : "Full screen";

  return (
    <button
      /* Before the spread, so both can be replaced, which is what translating
         the bar into another language needs. */
      aria-label={label}
      title={label}
      {...rest}
      className={
        className
          ? `${lottieFullscreenClass} ${className}`
          : lottieFullscreenClass
      }
      onClick={toggle}
      type="button"
    >
      {controlIcon(isFullscreen ? exitPath : enterPath)}
    </button>
  );
}
