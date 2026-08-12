import { LottieDisplay, useLottie } from "lottie-react";
import { useRef } from "react";

export function LiveReadouts() {
  const frame = useRef<HTMLSpanElement>(null);
  const state = useRef<HTMLSpanElement>(null);
  const lottie = useLottie({
    src: "/anim.json",
    autoplay: true,
    loop: true,
    subscriptions: {
      frame: ({ currentFrame }) => {
        if (frame.current) {
          frame.current.textContent = String(Math.round(currentFrame));
        }
      },
      newState: ({ state: next }) => {
        if (state.current) {
          state.current.textContent = next;
        }
      },
    },
  });

  return (
    <>
      <LottieDisplay lottie={lottie} />
      <p>
        frame <span ref={frame}>0</span>, state <span ref={state}>loading</span>
      </p>
    </>
  );
}
