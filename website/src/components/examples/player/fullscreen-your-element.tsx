import { LottieControls, LottieDisplay, useLottie } from "lottie-react";

export function FullscreenYourElement() {
  const lottie = useLottie({ src: "/anim.json", autoplay: true, loop: true });

  return (
    <div
      ref={lottie.setRootRef}
      style={{ display: "flex", flexDirection: "column", height: 240 }}
    >
      <LottieDisplay lottie={lottie} style={{ flex: 1, height: "auto" }} />
      <LottieControls lottie={lottie} />
    </div>
  );
}
