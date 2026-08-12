import type { FixedElementProps, LottieInstance } from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieSpeedClass = "lottie-speed";

/** The rates offered, slow ones included because inspecting a file needs them. */
const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

/** What this component owns. Every other prop belongs to the element. */
interface LottieSpeedSelectOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieSpeedSelect} accepts. */
export type LottieSpeedSelectProps = FixedElementProps<
  LottieSpeedSelectOwnProps,
  "select"
>;

/**
 * Chooses how fast the animation plays.
 *
 * A native `<select>`, which is what makes this control affordable at all. The
 * player this replaces built a custom dropdown whose options stayed in the
 * document when it was closed, so every animation on a page added seven
 * invisible tab stops, and it carried none of the menu semantics that would have
 * made a custom one usable. The native element has one tab stop and needs no
 * semantics of ours.
 *
 * A rate set from somewhere else, a prop or `setSpeed`, is added to the list
 * rather than ignored, so the control never sits blank or reports a rate the
 * animation is not playing at.
 */
export function LottieSpeedSelect({
  lottie,
  className,
  ...rest
}: LottieSpeedSelectProps) {
  const instance = useLottieInstance(lottie);
  const { speed } = instance;
  const offered = rates.includes(speed)
    ? rates
    : [...rates, speed].sort((first, second) => first - second);

  return (
    <select
      aria-label="Playback speed"
      title="Playback speed"
      {...rest}
      className={
        className ? `${lottieSpeedClass} ${className}` : lottieSpeedClass
      }
      onChange={(event) => {
        instance.setSpeed(Number(event.target.value));
      }}
      value={String(speed)}
    >
      {offered.map((rate) => (
        <option key={rate} value={String(rate)}>
          {rate}x
        </option>
      ))}
    </select>
  );
}
