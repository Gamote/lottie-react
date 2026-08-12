import { Lottie, LottieInteractions, lottieInView } from "lottie-react";

export function InView() {
  return (
    <LottieInteractions interactions={[lottieInView()]}>
      <Lottie src="/anim.json" loop />
    </LottieInteractions>
  );
}
