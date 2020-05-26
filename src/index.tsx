import LottieWebLibrary from "lottie-web";

import Lottie from "./components/Lottie";
import useLottie from "./hooks/useLottie";

// TODO: For backward compatibility, remove on v2
export const Animator = Lottie;
export const useAnimator = useLottie;

export { LottieWebLibrary, useLottie };

export default Lottie;
