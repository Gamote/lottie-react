import { Lottie, LottieControls, LottieDisplay } from "lottie-react";

export function NarrowBar() {
  return (
    <Lottie src="/anim.json" autoplay loop style={{ width: 288 }}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>
  );
}
