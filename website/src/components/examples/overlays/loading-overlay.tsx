import { Lottie, LottieDisplay, LottieLoading } from "lottie-react";

export function LoadingOverlay() {
  return (
    <Lottie src="/anim.json" autoplay loop>
      <LottieDisplay />
      <LottieLoading showAfter={0} />
    </Lottie>
  );
}
