import { useEffect, useRef } from "react";
import {
  type FixedElementProps,
  type LottieInstance,
  LottieSubscription,
} from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";

/** The class this control carries, which the bar's stylesheet targets. */
export const lottieSeekClass = "lottie-seek";

/** What this component owns. Every other prop belongs to the element. */
interface LottieSeekBarOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieSeekBar} accepts. */
export type LottieSeekBarProps = FixedElementProps<
  LottieSeekBarOwnProps,
  "input"
>;

/**
 * Shows where the playhead is, and moves it.
 *
 * A native range input, so the browser turns a frame number into a position on
 * the track and nothing here computes geometry. That also means the element
 * reports its own value to assistive technology, which is why no `aria-valuenow`
 * is written: one hardcoded here is exactly the defect the old player shipped,
 * where a screen reader was told the position was zero forever.
 *
 * The position is written straight onto the element rather than held in state,
 * because it changes on every rendered frame and this component would otherwise
 * re-render sixty times a second on top of the animation's own work. The input
 * is uncontrolled, which is what stops React putting its own value back.
 */
export function LottieSeekBar({
  lottie,
  className,
  ...rest
}: LottieSeekBarProps) {
  const instance = useLottieInstance(lottie);
  const { subscribe, playableFrames, animationItem } = instance;
  const element = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);

  /*
   * Stops listening for the end of a drag. Held here rather than in the handler
   * that installs it so that unmounting part-way through a gesture takes the
   * listeners with it.
   */
  const stopWatching = useRef<() => void>(() => undefined);
  useEffect(
    () => () => {
      stopWatching.current();
    },
    [],
  );

  useEffect(() => {
    const write = (frame: number) => {
      const node = element.current;
      /* A drag owns the value while it lasts, or the animation would fight the
         pointer for the thumb. */
      if (node !== null && !dragging.current) {
        node.value = String(frame);
      }
    };

    /*
     * Seeded from the engine rather than from zero, because this can be rendered
     * long after the animation loaded, and a frame event only says where the
     * playhead is once it next moves.
     */
    write(animationItem === null ? 0 : animationItem.currentFrame);

    return subscribe(LottieSubscription.frame, ({ currentFrame }) => {
      write(currentFrame);
    });
  }, [subscribe, animationItem]);

  return (
    <input
      aria-label="Seek"
      title="Seek"
      {...rest}
      className={
        className ? `${lottieSeekClass} ${className}` : lottieSeekClass
      }
      defaultValue={0}
      /*
       * One less than the count, because `playableFrames` is a duration rather
       * than a last frame number: the frames of a 32 frame animation are 0 to
       * 31 and the frame at 32 is never drawn. Against a maximum of 32 the
       * thumb stopped 3% short of the end of its track and stayed there, which
       * reads as unfinished.
       */
      max={Math.max(playableFrames - 1, 0)}
      min={0}
      onChange={(event) => {
        const frame = Number(event.target.value);
        /*
         * The two routes are not the same operation. A drag pauses on the way in
         * and restores playback on the way out, which is what `scrub` exists
         * for; a keyboard press is a single jump, and seeking leaves playback
         * alone, so an animation being arrowed through carries on playing.
         */
        if (dragging.current) {
          instance.scrubTo(frame);
        } else {
          instance.seek(frame);
        }
      }}
      onKeyDown={(event) => {
        const forward = event.key === "ArrowRight" || event.key === "ArrowUp";
        const back = event.key === "ArrowLeft" || event.key === "ArrowDown";
        if (!forward && !back) {
          return;
        }

        /*
         * The element's own arrow handling is replaced rather than adjusted.
         * With no step to follow it moves by a hundredth of the range, which on
         * a short animation is a fraction of a frame and renders the picture
         * already showing.
         */
        event.preventDefault();

        /*
         * Stepping a frame at a time only means anything while stopped: playing,
         * the engine covers half a frame every tick and has overtaken the new
         * position before it can be seen. So the first press stops it, the way
         * stepping through a timeline does anywhere else.
         */
        instance.pause();

        const node = element.current;
        const from = node === null ? 0 : Number(node.value);
        instance.seek(forward ? Math.floor(from) + 1 : Math.ceil(from) - 1);
      }}
      onPointerDown={() => {
        dragging.current = true;
        instance.scrubStart();

        /*
         * The release is heard on the window rather than on this element,
         * because a pointer let go somewhere else still ends the gesture, and
         * whether a range input keeps the pointer captured to the end is a
         * browser behaviour this library would rather not depend on.
         */
        const end = () => {
          stopWatching.current();
          dragging.current = false;
          instance.scrubEnd();
        };
        stopWatching.current = () => {
          stopWatching.current = () => undefined;
          window.removeEventListener("pointerup", end);
          window.removeEventListener("pointercancel", end);
        };
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
      }}
      ref={element}
      /*
       * No stepping, so the thumb sits exactly where the animation is. With a
       * step of one frame the element rounds every value written to it, which
       * on a short animation leaves the thumb only as many positions as there
       * are frames: measured in Chromium, a written 12.503 is stored as 13, so
       * half the engine's updates moved nothing and the rest jumped a whole
       * frame's width. The keyboard is handled above rather than lost with it.
       */
      step="any"
      type="range"
    />
  );
}
