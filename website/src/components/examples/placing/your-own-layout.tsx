import { Lottie, LottieDisplay } from "lottie-react";

export function YourOwnLayout() {
  return (
    <Lottie src="/anim.json" autoplay loop>
      <p>The logo, placed by you</p>
      <LottieDisplay />
    </Lottie>
  );
}
