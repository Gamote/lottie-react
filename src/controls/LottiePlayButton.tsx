import {
  type FixedElementProps,
  type LottieInstance,
  LottieState,
} from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import { controlIcon } from "./controlIcon.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottiePlayClass = "lottie-play";

const playPath = "M8 5v14l11-7z";
const pausePath = "M6 5h4v14H6zm8 0h4v14h-4z";

/** What this component owns. Every other prop belongs to the element. */
interface LottiePlayButtonOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottiePlayButton} accepts. */
export type LottiePlayButtonProps = FixedElementProps<
  LottiePlayButtonOwnProps,
  "button"
>;

/**
 * Starts the animation, or stops it where it is.
 *
 * One button rather than two, so that pressing it does not unmount the element
 * that has focus. The player this replaces rendered play and pause as separate
 * components in separate positions, which dropped focus to the document body
 * every time someone pressed either with the keyboard.
 */
export function LottiePlayButton({
  lottie,
  className,
  ...rest
}: LottiePlayButtonProps) {
  const instance = useLottieInstance(lottie);
  const playing = instance.state === LottieState.playing;
  const label = playing ? "Pause" : "Play";

  return (
    <button
      /* Before the spread, so both can be replaced, which is what translating
         the bar into another language needs. */
      aria-label={label}
      title={label}
      {...rest}
      className={
        className ? `${lottiePlayClass} ${className}` : lottiePlayClass
      }
      onClick={playing ? instance.pause : instance.play}
      type="button"
    >
      {controlIcon(playing ? pausePath : playPath)}
    </button>
  );
}
