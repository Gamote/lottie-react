import { Lottie } from "lottie-react";
import anim from "../../../../public/anim.json";

export function SrcAsObject() {
  return <Lottie src={anim} autoplay loop />;
}
