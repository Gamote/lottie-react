import { LottieInteractions, lottieScrollScrub, useLottie } from "lottie-react";
import { useRef } from "react";

/**
 * The scroll-scrubbing page's own demo: an animation in the page's flow,
 * scrubbed by the reader's scroll through the page, with the frame it landed
 * on read out beside it. The readout writes to the DOM directly: a frame
 * subscription fires every frame, and sixty state updates a second would
 * re-render sixty times a second.
 */
export function PageScrub() {
  const frame = useRef<HTMLSpanElement>(null);
  const lottie = useLottie({
    src: "/anim.json",
    subscriptions: {
      frame: ({ currentFrame }) => {
        if (frame.current) {
          frame.current.textContent = String(Math.round(currentFrame));
        }
      },
    },
  });

  return (
    <LottieInteractions lottie={lottie} interactions={[lottieScrollScrub()]}>
      <div
        ref={lottie.setRootRef}
        className="not-prose flex items-center justify-center gap-6 rounded-lg border p-6"
      >
        <div ref={lottie.setDisplayRef} className="size-32" />
        <p className="font-mono text-sm">
          frame <span ref={frame}>0</span> of {lottie.playableFrames}, scrolled
          there by you
        </p>
      </div>
    </LottieInteractions>
  );
}
