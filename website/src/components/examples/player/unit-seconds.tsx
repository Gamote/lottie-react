import { Lottie, LottieControls, LottieDisplay } from "lottie-react";

export function UnitSeconds() {
  return (
    <Lottie src="/anim.json" autoplay loop>
      <LottieDisplay />
      <LottieControls unit="seconds" />
    </Lottie>
  );
}
