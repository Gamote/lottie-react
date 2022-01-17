import lottieFull from "lottie-web";
import { LottieVersion } from "../@types";
import { lottieHoc } from "./lottieHoc";

/**
 * Lottie's full animation component
 */
export const Lottie = lottieHoc<LottieVersion.Full>(lottieFull);
