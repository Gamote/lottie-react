import { LottieLight } from "lottie-react";

export function Loader() {
  return (
    <LottieLight
      src="/anim.json"
      autoplay
      loop
      speed={2}
      style={{ width: 48, height: 48 }}
    />
  );
}
