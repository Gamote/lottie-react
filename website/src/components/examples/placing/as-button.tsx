import { Lottie, type LottieHandle } from "lottie-react";
import { useRef } from "react";

export function AsButton() {
  const handle = useRef<LottieHandle>(null);

  return (
    <Lottie
      as="button"
      src="/anim.json"
      lottieRef={handle}
      onClick={() => handle.current?.play()}
      aria-label="Play the logo"
    />
  );
}
