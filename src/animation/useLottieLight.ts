"use client";

import lottieLight from "lottie-web/build/player/lottie_light.js";
import { type LottieEngine, LottieEngineName } from "./configureLottie.js";
import type { LottieInstance, LottieRenderer } from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

/**
 * Loads and drives an animation using the light build of the engine.
 *
 * Identical to {@link useLottie} except that `svg` is the only renderer, which
 * the type enforces: the light build does not contain the other two, and asking
 * it for one throws at runtime while its own declarations claim otherwise.
 * It also carries no expression engine, so a property an expression drives is
 * drawn at its static value; {@link useLottieSvg} is the smaller build that
 * keeps expressions.
 */
/** The light engine: svg only, no expressions, no `eval`. */
export const lightEngine: LottieEngine = {
  player: lottieLight,
  name: LottieEngineName.light,
};

export function useLottieLight(
  options: UseLottieOptions<typeof LottieRenderer.svg>,
): LottieInstance {
  return useLottieAnimation(lightEngine, options);
}
