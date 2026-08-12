import { Lottie, LottieInteractions, lottieScrollScrub } from "lottie-react";

export function ScrollScrub() {
  return (
    <LottieInteractions interactions={[lottieScrollScrub()]}>
      <Lottie src="/anim.json" />
    </LottieInteractions>
  );
}
