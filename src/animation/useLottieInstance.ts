"use client";

import { useContext } from "react";
import { LottieInstanceContext } from "./LottieInstanceContext.js";
import type { LottieInstance } from "./types.js";

/**
 * The animation a child component should drive: the one it was handed, else the
 * one its `<Lottie>` published.
 *
 * The prop wins, so a child given an animation explicitly is never quietly
 * driven by a surrounding one. Reaching neither is a thrown error rather than a
 * silent no-op, because a control bar that renders and does nothing is a worse
 * failure than one that never renders.
 */
export function useLottieInstance(explicit?: LottieInstance): LottieInstance {
  const provided = useContext(LottieInstanceContext);
  const instance = explicit ?? provided;

  if (instance === null) {
    throw new Error(
      "lottie-react: no animation to work with. Render this inside <Lottie>, or pass lottie={…} from useLottie().",
    );
  }

  return instance;
}
