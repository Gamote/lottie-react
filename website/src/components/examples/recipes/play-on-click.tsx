import { Lottie, type LottieHandle } from "lottie-react";
import { useRef } from "react";

export function PlayOnClick() {
  const handle = useRef<LottieHandle>(null);

  const restart = () => {
    handle.current?.seek(0);
    handle.current?.play();
  };

  return (
    <Lottie
      as="button"
      src="/anim.json"
      lottieRef={handle}
      onClick={restart}
      aria-label="Play from the top"
    />
  );
}
