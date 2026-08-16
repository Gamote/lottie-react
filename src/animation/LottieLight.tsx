"use client";

import type { ReactNode } from "react";
import {
  createLottieComponent,
  type LottieComponentProps,
} from "./createLottieComponent.js";
import type { AnyTag, LottieRenderer, RendererInLight } from "./types.js";
import { lightEngine } from "./useLottieLight.js";

/**
 * What {@link LottieLight} accepts. Identical to `LottieProps` except that
 * `renderer` admits only what the light build contains.
 */
export type LottieLightProps<
  As extends AnyTag = "div",
  Children extends ReactNode = undefined,
  Renderer extends RendererInLight = typeof LottieRenderer.svg,
> = LottieComponentProps<As, Children, Renderer>;

/**
 * Renders an animation using the light build of the engine.
 *
 * Identical to {@link Lottie} except that `svg` is the only renderer, which the
 * type enforces: the light build does not contain the other two, and asking it
 * for one throws at runtime while its own declarations claim otherwise.
 *
 * It also carries no expression engine, so a property an expression drives is
 * drawn at its static value; {@link LottieSvg} is the smaller build that keeps
 * expressions.
 */
export const LottieLight = createLottieComponent<RendererInLight>(lightEngine);
