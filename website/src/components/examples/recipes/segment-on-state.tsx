import { LottieDisplay, useLottie } from "lottie-react";
import { useEffect, useState } from "react";

const parts = {
  grow: [0, 60],
  settle: [60, 120],
} as const;

export function SegmentOnState() {
  const [part, setPart] = useState<keyof typeof parts>("grow");
  const lottie = useLottie({ src: "/anim.json", autoplay: true, loop: true });
  const { playSegments } = lottie;

  useEffect(() => {
    playSegments(parts[part]);
  }, [part, playSegments]);

  return (
    <>
      <LottieDisplay lottie={lottie} />
      <div>
        <button type="button" onClick={() => setPart("grow")}>
          grow
        </button>
        <button type="button" onClick={() => setPart("settle")}>
          settle
        </button>
      </div>
    </>
  );
}
