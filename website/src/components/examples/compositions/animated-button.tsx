import { Lottie, type LottieHandle } from "lottie-react";
import { useRef, useState } from "react";

export function AnimatedButton() {
  const handle = useRef<LottieHandle>(null);
  const [busy, setBusy] = useState(false);

  const save = () => {
    setBusy(true);
    handle.current?.seek(0);
    handle.current?.play();
    setTimeout(() => setBusy(false), 1500);
  };

  return (
    <button type="button" disabled={busy} onClick={save}>
      <Lottie
        as="span"
        src="/anim.json"
        lottieRef={handle}
        style={{
          display: "inline-block",
          width: 20,
          height: 20,
          verticalAlign: "middle",
        }}
      />{" "}
      {busy ? "Saving" : "Save"}
    </button>
  );
}
