import type { ReactNode } from "react";
import {
  createLottieComponent,
  type LottieComponentProps,
} from "./createLottieComponent.js";
import type { AnyTag, LottieRenderer, RendererInSvg } from "./types.js";
import { svgEngine } from "./useLottieSvg.js";

/**
 * What {@link LottieSvg} accepts. Identical to `LottieProps` except that
 * `renderer` admits only what the svg build contains.
 */
export type LottieSvgProps<
  As extends AnyTag = "div",
  Children extends ReactNode = undefined,
  Renderer extends RendererInSvg = typeof LottieRenderer.svg,
> = LottieComponentProps<As, Children, Renderer>;

/**
 * Renders an animation using the svg build of the engine.
 *
 * Identical to {@link Lottie} except that `svg` is the only renderer, which the
 * type enforces: the svg build does not contain the other two, and asking it
 * for one throws at runtime while its own declarations claim otherwise.
 *
 * It sits between the other two builds: smaller than the full one because it
 * carries a single renderer, and unlike {@link LottieLight} it keeps the
 * expression engine, so an animation whose properties are driven by
 * expressions plays as designed.
 */
export const LottieSvg = createLottieComponent<RendererInSvg>(svgEngine);
