import { Lottie, type LottieHandle } from "lottie-react";
import { useRef } from "react";

export function SeekUnits() {
  const handle = useRef<LottieHandle>(null);

  return (
    <>
      <Lottie src="/anim.json" autoplay loop lottieRef={handle} />
      <div>
        <button type="button" onClick={() => handle.current?.seek(135)}>
          frame 135
        </button>
        <button
          type="button"
          onClick={() => handle.current?.seek({ percent: 50 })}
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => handle.current?.seek({ seconds: 1 })}
        >
          1s
        </button>
        <button
          type="button"
          onClick={() => handle.current?.seek({ marker: "middle" })}
        >
          marker
        </button>
      </div>
    </>
  );
}
