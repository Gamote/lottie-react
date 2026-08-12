import { LottieDisplay, useLottie } from "lottie-react";

export function CommandButtons() {
  const lottie = useLottie({ src: "/anim.json", loop: true });

  return (
    <>
      <LottieDisplay lottie={lottie} />
      <div>
        <button type="button" onClick={() => lottie.play()}>
          play
        </button>
        <button type="button" onClick={() => lottie.pause()}>
          pause
        </button>
        <button type="button" onClick={() => lottie.stop()}>
          stop
        </button>
        <button type="button" onClick={() => lottie.seek({ percent: 50 })}>
          seek 50%
        </button>
      </div>
    </>
  );
}
