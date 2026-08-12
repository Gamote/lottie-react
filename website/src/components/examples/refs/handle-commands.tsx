import { Lottie, type LottieHandle } from "lottie-react";
import { useRef } from "react";

export function HandleCommands() {
  const handle = useRef<LottieHandle>(null);

  return (
    <>
      <Lottie src="/anim.json" loop lottieRef={handle} />
      <div>
        <button type="button" onClick={() => handle.current?.play()}>
          play
        </button>
        <button type="button" onClick={() => handle.current?.pause()}>
          pause
        </button>
      </div>
    </>
  );
}
