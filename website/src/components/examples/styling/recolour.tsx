import { Lottie } from "lottie-react";

export function Recolour() {
  return (
    <Lottie
      src="/anim.json"
      autoplay
      loop
      className="size-32 text-pink-500 [&_svg_path]:fill-current [&_svg_path]:stroke-current"
    />
  );
}
