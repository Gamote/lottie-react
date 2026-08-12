import { Lottie } from "lottie-react";
import { useState } from "react";

export function SpeedAndDirection() {
  const [speed, setSpeed] = useState(1);
  const [reversed, setReversed] = useState(false);

  return (
    <>
      <Lottie
        src="/anim.json"
        autoplay
        loop
        speed={speed}
        direction={reversed ? "reverse" : "forward"}
      />
      <div>
        <button
          type="button"
          onClick={() =>
            setSpeed((current) => (current >= 4 ? 0.5 : current * 2))
          }
        >
          speed {speed}x
        </button>
        <button
          type="button"
          onClick={() => setReversed((current) => !current)}
        >
          {reversed ? "reverse" : "forward"}
        </button>
      </div>
    </>
  );
}
