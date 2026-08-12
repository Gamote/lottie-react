import type { FixedElementProps, LottieInstance } from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import { controlIcon } from "./controlIcon.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieLoopClass = "lottie-loop";

const loopPath =
  "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z";

/** What this component owns. Every other prop belongs to the element. */
interface LottieLoopButtonOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Turns looping off and on again, keeping a numeric count. */
  toggle: () => void;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieLoopButton} accepts. */
export type LottieLoopButtonProps = FixedElementProps<
  LottieLoopButtonOwnProps,
  "button"
>;

/**
 * Turns looping on and off.
 *
 * The switching itself is handed in rather than done here, because the `l`
 * shortcut does the same thing and the count in force has to be remembered
 * across both. Two memories would mean pressing the key and then the button
 * loses a `loop={3}`, which is the exact fault that got the old surface's
 * `toggleLoop` dropped rather than rebuilt.
 */
export function LottieLoopButton({
  lottie,
  toggle,
  className,
  ...rest
}: LottieLoopButtonProps) {
  const instance = useLottieInstance(lottie);
  const looping = instance.loop !== false;

  return (
    <button
      aria-label="Loop"
      title="Loop"
      {...rest}
      aria-pressed={looping}
      className={
        className ? `${lottieLoopClass} ${className}` : lottieLoopClass
      }
      onClick={toggle}
      type="button"
    >
      {controlIcon(loopPath)}
    </button>
  );
}
