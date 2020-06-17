import LottiePlayer from "lottie-web";

import Lottie from "./components/Lottie";
import useLottie from "./hooks/useLottie";

// TODO: For backward compatibility, remove on v2
export const Animator: typeof Lottie = Lottie;
export const useAnimator: typeof useLottie = useLottie;

export { LottiePlayer, useLottie };

export default Lottie;
export * from "./types";
