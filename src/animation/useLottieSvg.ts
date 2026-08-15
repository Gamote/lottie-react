import lottieSvg from "lottie-web/build/player/lottie_svg.js";
import type { LottieInstance, LottieRenderer } from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

/**
 * Loads and drives an animation using the svg build of the engine.
 *
 * Identical to {@link useLottie} except that `svg` is the only renderer, which
 * the type enforces: the svg build does not contain the other two, and asking
 * it for one throws at runtime while its own declarations claim otherwise.
 * Unlike {@link useLottieLight} it keeps the expression engine.
 */
export function useLottieSvg(
  options: UseLottieOptions<typeof LottieRenderer.svg>,
): LottieInstance {
  return useLottieAnimation(lottieSvg, options);
}
