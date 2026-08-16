"use client";

import lottie from "lottie-web";
import { type LottieEngine, LottieEngineName } from "./configureLottie.js";
import type { LottieInstance, LottieRenderer } from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

/**
 * Loads and drives an animation, and hands back everything needed to render it
 * and to control it.
 *
 * Give `setDisplayRef` to the element the animation should be drawn inside;
 * nothing appears until you do. Give it a size, too, since the animation fills
 * whatever box it is in and a box of no height shows nothing.
 *
 * ```jsx
 * const lottie = useLottie({ src });
 * return <div ref={lottie.setDisplayRef} style={{ height: 300 }} />;
 * ```
 *
 * An element takes one `ref`, so reach it and hand it to us in one callback
 * when you want both. Wrapping that callback in `useCallback` stops React
 * detaching and reattaching it on every render.
 *
 * ```jsx
 * const mine = useRef(null);
 * const setRef = useCallback(
 *   (node) => { mine.current = node; lottie.setDisplayRef(node); },
 *   [lottie.setDisplayRef],
 * );
 * ```
 *
 * This is the full build, so every renderer is available. Reach for
 * `useLottieSvg` instead when only `svg` is needed, or `useLottieLight` when
 * the animation uses no expressions either: each carries a smaller copy of the
 * engine.
 */
/** The full engine: every renderer, expressions included. */
export const fullEngine: LottieEngine = {
  player: lottie,
  name: LottieEngineName.full,
};

export function useLottie<
  Renderer extends LottieRenderer = typeof LottieRenderer.svg,
>(options: UseLottieOptions<Renderer>): LottieInstance {
  return useLottieAnimation(fullEngine, options);
}
