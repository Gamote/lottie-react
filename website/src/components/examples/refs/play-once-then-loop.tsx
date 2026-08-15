import { Lottie, type LottieHandle } from "lottie-react";
import { useRef } from "react";

export function PlayOnceThenLoop() {
  const handle = useRef<LottieHandle>(null);
  const narrowed = useRef(false);

  return (
    <Lottie
      src="/anim.json"
      autoplay
      loop
      lottieRef={handle}
      subscriptions={{
        loopCompleted: () => {
          if (narrowed.current) return;
          narrowed.current = true;
          handle.current?.playSegments({ marker: "middle" });
        },
      }}
    />
  );
}
