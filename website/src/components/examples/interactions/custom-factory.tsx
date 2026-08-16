import {
  Lottie,
  type LottieInteraction,
  LottieInteractions,
} from "lottie-react";

function playWhilePressed(): LottieInteraction {
  return {
    options: undefined,
    attach: (context) => {
      let detach: (() => void) | undefined;
      const arm = () => {
        const root = context.lottie.root;
        if (root === null || detach !== undefined) return;
        const down = () => context.lottie.play();
        const up = () => context.lottie.pause();
        root.addEventListener("pointerdown", down);
        root.addEventListener("pointerup", up);
        detach = () => {
          root.removeEventListener("pointerdown", down);
          root.removeEventListener("pointerup", up);
        };
      };
      arm();
      const stop = context.onChange(arm);
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
