import { Lottie, type LottieHandle } from "lottie-react";
import { useRef } from "react";

export function QueueIntroThenLoop() {
  const handle = useRef<LottieHandle>(null);

  return (
    <Lottie
      src="/anim.json"
      autoplay
      loop
      lottieRef={handle}
      subscriptions={{
        ready: () =>
          handle.current?.playSegments({ marker: "middle" }, { queue: true }),
      }}
    />
  );
}
