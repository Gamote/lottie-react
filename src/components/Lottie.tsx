import { forwardRef, ForwardRefRenderFunction } from "react";
import useLottie from "../hooks/useLottie";
import useLottieInteractivity from "../hooks/useLottieInteractivity";
import { LottieComponentProps, LottieRefCurrentProps } from "../types";

const Lottie: ForwardRefRenderFunction<LottieRefCurrentProps, LottieComponentProps> = (
  { lottieRef, interactivity, onEvent, onStateChange, containerProps, ...config },
  ref,
) => {
  const lottieObject = useLottie({
    onEvent,
    onStateChange,
    containerProps,
    ...config,
  });
  const { View } = lottieObject;

  /**
   * Make the player object available through the provided 'ref'
   */
  if (ref) {
    if (typeof ref === "function") {
      ref(lottieObject);
    } else {
      ref.current = lottieObject;
    }
  }

  /**
   * Make the lottie object available through the provided 'lottieRef'
   */
  if (lottieRef) {
    lottieRef.current = lottieObject.animationItem;
  }

  /**
   * Interactive view
   */
  const interactivityL = useLottieInteractivity({
    lottieObject,
    mode: "scroll",
    actions: [
      {
        visibility: [0, 0.2],
        type: "stop",
        frames: [0],
      },
      {
        visibility: [0.2, 0.45],
        type: "seek",
        frames: [0, 45],
      },
      {
        visibility: [0.45, 1.0],
        type: "loop",
        frames: [45, 60],
      },
    ],
    ...interactivity,
  });

  if (interactivity) {
    return interactivityL;
  }

  return View;
};

export default forwardRef(Lottie);
