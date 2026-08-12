import { Lottie, LottieInteractions, lottieScrollScrub } from "lottie-react";

export function ScrollStory() {
  return (
    <>
      <p>Scroll to grow the logo.</p>
      <LottieInteractions
        interactions={[lottieScrollScrub({ range: [0.2, 0.8] })]}
      >
        <Lottie src="/anim.json" />
      </LottieInteractions>
      <p>And settle it again.</p>
    </>
  );
}
