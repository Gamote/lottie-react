import { useLottie } from "lottie-react";

export function FirstAnimationHook() {
  const lottie = useLottie({ src: "/anim.json", autoplay: true, loop: true });
  return <div ref={lottie.setDisplayRef} style={{ width: 128, height: 128 }} />;
}
