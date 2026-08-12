import { LottieDisplay, useLottie } from "lottie-react";

export function PlaySegments() {
  const lottie = useLottie({ src: "/anim.json", autoplay: true, loop: true });

  return (
    <>
      <LottieDisplay lottie={lottie} />
      <p>playable frames: {lottie.playableFrames}</p>
      <div>
        <button type="button" onClick={() => lottie.playSegments([0, 90])}>
          first half
        </button>
        <button type="button" onClick={() => lottie.playSegments([90, 180])}>
          second half
        </button>
        <button
          type="button"
          onClick={() => lottie.playSegments({ marker: "middle" })}
        >
          marker span
        </button>
        <button type="button" onClick={() => lottie.resetSegments()}>
          whole file
        </button>
      </div>
    </>
  );
}
