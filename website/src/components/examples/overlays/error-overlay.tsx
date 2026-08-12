import {
  Lottie,
  LottieDisplay,
  LottieError,
  type LottieHandle,
} from "lottie-react";
import { useRef } from "react";

export function ErrorOverlay() {
  const handle = useRef<LottieHandle>(null);

  return (
    <Lottie src="/missing.json" lottieRef={handle}>
      <LottieDisplay />
      <LottieError>
        <button type="button" onClick={() => handle.current?.reload()}>
          Try again
        </button>
      </LottieError>
    </Lottie>
  );
}
