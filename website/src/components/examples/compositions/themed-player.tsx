import { Lottie, LottieControls, LottieDisplay } from "lottie-react";

export function ThemedPlayer() {
  return (
    <Lottie src="/anim.json" autoplay loop style={{ color: "rebeccapurple" }}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>
  );
}
