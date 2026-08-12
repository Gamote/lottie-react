import {
  type FixedElementProps,
  LottieDirection,
  type LottieInstance,
} from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import { controlIcon } from "./controlIcon.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieDirectionClass = "lottie-direction";

const forwardPath = "M4 18l8.5-6L4 6zm9 0l8.5-6L13 6z";
const reversePath = "M20 18V6l-8.5 6zm-9 0V6l-8.5 6z";

/** What this component owns. Every other prop belongs to the element. */
interface LottieDirectionButtonOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieDirectionButton} accepts. */
export type LottieDirectionButtonProps = FixedElementProps<
  LottieDirectionButtonOwnProps,
  "button"
>;

/**
 * Turns playing in reverse on and off.
 *
 * The label names the control rather than the next action, and `aria-pressed`
 * carries which way it is currently set. Naming the action instead is what left
 * the old player saying "Reverse direction" while showing a forward arrow, so a
 * reader had to guess whether either described the present.
 */
export function LottieDirectionButton({
  lottie,
  className,
  ...rest
}: LottieDirectionButtonProps) {
  const instance = useLottieInstance(lottie);
  const reversed = instance.direction === LottieDirection.reverse;

  return (
    <button
      aria-label="Play in reverse"
      title="Play in reverse"
      {...rest}
      aria-pressed={reversed}
      className={
        className
          ? `${lottieDirectionClass} ${className}`
          : lottieDirectionClass
      }
      onClick={() => {
        instance.setDirection(
          reversed ? LottieDirection.forward : LottieDirection.reverse,
        );
      }}
      type="button"
    >
      {controlIcon(reversed ? reversePath : forwardPath)}
    </button>
  );
}
