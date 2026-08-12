import { Lottie, LottieControls, LottieDisplay } from "lottie-react";

export function ControlBar() {
  return (
    <Lottie src="/anim.json" autoplay loop>
      <LottieDisplay />
      <LottieControls />
    </Lottie>
  );
}
