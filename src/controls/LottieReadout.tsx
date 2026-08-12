import { useEffect, useRef } from "react";
import {
  type FixedElementProps,
  type LottieInstance,
  LottieSubscription,
} from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieReadoutClass = "lottie-readout";

/**
 * What the position is counted in.
 *
 * A plain union rather than an object map, unlike the library's public
 * vocabulary, because nothing reads it at runtime: it is only ever written as a
 * literal at a call site, so a runtime object would ship to every consumer of
 * the bar in order to serve nobody.
 */
export type LottieReadoutUnit = "frames" | "seconds";

/**
 * One position, in whichever unit was asked for.
 *
 * Seconds carry one decimal rather than the `0:04` a video player would use.
 * Most animations are a few seconds long, so minutes are always zero and the
 * seconds place is the only one doing any work, which makes dragging look like
 * it is doing nothing.
 */
function format(
  frames: number,
  secondsPerFrame: number,
  unit: LottieReadoutUnit,
): string {
  return unit === "seconds"
    ? `${(frames * secondsPerFrame).toFixed(1)}s`
    : String(Math.round(frames));
}

/** What this component owns. Every other prop belongs to the element. */
interface LottieReadoutOwnProps {
  /** The animation to read. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** What to count in. Frames unless you say otherwise. */
  unit?: LottieReadoutUnit;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieReadout} accepts. */
export type LottieReadoutProps = FixedElementProps<
  LottieReadoutOwnProps,
  "output"
>;

/**
 * Where the playhead is, and how far it has to go.
 *
 * Both numbers describe what is currently playable rather than the whole file,
 * so a segment moves them together. With nothing loaded they are zeros, which
 * keeps the element the same shape it will be a moment later.
 *
 * Like the seek bar, the moving half is written straight onto the element rather
 * than held in state, because it changes on every rendered frame.
 */
export function LottieReadout({
  lottie,
  unit = "frames",
  className,
  ...rest
}: LottieReadoutProps) {
  const instance = useLottieInstance(lottie);
  const { subscribe, playableFrames, playableDuration, animationItem } =
    instance;
  const element = useRef<HTMLSpanElement>(null);
  const secondsPerFrame =
    playableFrames === 0 ? 0 : playableDuration / playableFrames;

  useEffect(() => {
    const write = (frame: number) => {
      const node = element.current;
      if (node !== null) {
        node.textContent = format(frame, secondsPerFrame, unit);
      }
    };

    /*
     * Written once on the way in as well as on every frame, so that changing the
     * unit, or loading a segment, redraws the number that is already showing
     * rather than waiting for a playhead that may never move again.
     */
    write(animationItem === null ? 0 : animationItem.currentFrame);

    return subscribe(LottieSubscription.frame, ({ currentFrame }) => {
      write(currentFrame);
    });
  }, [subscribe, animationItem, secondsPerFrame, unit]);

  /*
   * The last position rather than the count, which are one apart: `playableFrames`
   * is a length, so an animation of 32 has frames 0 to 31 and the playhead
   * never reaches 32. Counting to the length would put a number over the
   * readout that the number under it can never reach, so it could never read as
   * finished. This is the same quantity the seek bar takes as its maximum, so
   * the two say the same thing and arrive at their end together.
   */
  const total = format(Math.max(playableFrames - 1, 0), secondsPerFrame, unit);

  return (
    <output
      {...rest}
      className={
        className ? `${lottieReadoutClass} ${className}` : lottieReadoutClass
      }
    >
      {/*
       * Only the half that moves is held to a width, and the width is the one
       * the total already has, since a position on the same scale can never
       * print wider than its own total. Reserving the whole element instead
       * needs a number chosen per unit, and the one that fitted frames did
       * nothing in seconds, so the element grew as the value gained a digit and
       * every control to its right slid sideways under the pointer.
       */}
      <span ref={element} style={{ minWidth: `${String(total.length)}ch` }}>
        {format(0, secondsPerFrame, unit)}
      </span>
      {` / ${total}`}
    </output>
  );
}
