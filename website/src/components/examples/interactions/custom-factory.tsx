import {
  Lottie,
  type LottieInteraction,
  LottieInteractions,
} from "lottie-react";

function playWhilePressed(): LottieInteraction {
  return {
    options: undefined,
    attach: ({ lottie, onChange }) => {
      let detach: (() => void) | undefined;
      const arm = () => {
        const root = lottie.root;
        if (root === null || detach !== undefined) return;
        const down = () => lottie.play();
        const up = () => lottie.pause();
        root.addEventListener("pointerdown", down);
        root.addEventListener("pointerup", up);
        detach = () => {
          root.removeEventListener("pointerdown", down);
          root.removeEventListener("pointerup", up);
        };
      };
      arm();
      const stop = onChange(arm);
      return () => {
        stop();
        detach?.();
      };
    },
  };
}

export function CustomFactory() {
  return (
    <LottieInteractions interactions={[playWhilePressed()]}>
      <Lottie src="/anim.json" loop />
    </LottieInteractions>
  );
}
