import { LottieDisplay, useLottie } from "lottie-react";

export function HoverPlay() {
  const lottie = useLottie({ src: "/anim.json", loop: true });

  return (
    <LottieDisplay
      lottie={lottie}
      onPointerEnter={() => lottie.play()}
      onPointerLeave={() => lottie.pause()}
    />
  );
}
