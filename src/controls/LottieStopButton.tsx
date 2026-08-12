import type { FixedElementProps, LottieInstance } from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import { controlIcon } from "./controlIcon.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieStopClass = "lottie-stop";

const stopPath = "M6 6h12v12H6z";

/** What this component owns. Every other prop belongs to the element. */
interface LottieStopButtonOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieStopButton} accepts. */
export type LottieStopButtonProps = FixedElementProps<
  LottieStopButtonOwnProps,
  "button"
>;

/**
 * Stops the animation and returns it to the first frame of what is playable.
 *
 * Distinct from pausing, which leaves the playhead where it is. Both exist
 * because this control set is for inspecting a file, where returning to a known
 * position is something you do constantly.
 */
export function LottieStopButton({
  lottie,
  className,
  ...rest
}: LottieStopButtonProps) {
  const instance = useLottieInstance(lottie);

  return (
    <button
      aria-label="Stop"
      title="Stop"
      {...rest}
      className={
        className ? `${lottieStopClass} ${className}` : lottieStopClass
      }
      onClick={instance.stop}
      type="button"
    >
      {controlIcon(stopPath)}
    </button>
  );
}
