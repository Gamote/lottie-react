import { LottieDisplay, useLottie } from "lottie-react";

export function CursorFollow() {
  const lottie = useLottie({ src: "/anim.json" });

  return (
    <LottieDisplay
      lottie={lottie}
      className="size-48 touch-none"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        lottie.seek({
          percent: ((event.clientX - box.left) / box.width) * 100,
        });
      }}
      onPointerLeave={() => lottie.seek(0)}
    />
  );
}
