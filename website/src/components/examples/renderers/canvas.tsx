import { Lottie } from "lottie-react";

export function Canvas() {
  return <Lottie src="/anim.json" autoplay loop renderer="canvas" />;
}
