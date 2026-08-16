"use client";

import type { ReactNode } from "react";
import {
  createLottieComponent,
  type LottieComponentProps,
} from "./createLottieComponent.js";
import type { AnyTag, LottieRenderer } from "./types.js";
import { fullEngine } from "./useLottie.js";

/**
 * What {@link Lottie} accepts: our own props, plus every attribute of the
 * element it renders.
 *
 * Our props all carry a description, so hovering one at the call site tells you
 * whose it is. Everything else belongs to the element and behaves exactly as it
 * does anywhere else.
 */
export type LottieProps<
  As extends AnyTag = "div",
  Children extends ReactNode = undefined,
  Renderer extends LottieRenderer = typeof LottieRenderer.svg,
> = LottieComponentProps<As, Children, Renderer>;

/**
 * Renders an animation.
 *
 * With no children it is the animation itself: the element it renders is where
 * the animation is drawn, and `className`, `style` and every other attribute
 * land on that element. Give it a size, since an animation fills whatever box
 * it is in and a box of no height shows nothing.
 *
 * ```jsx
 * <Lottie src={animation} className="h-64" autoplay loop />
 * ```
 *
 * With children it steps back and becomes the box around them, and you say
 * where the animation goes with `<LottieDisplay>`. Anything else you render
 * beside it finds the same animation without being handed it.
 *
 * ```jsx
 * <Lottie src={animation}>
 *   <MyCaption />
 *   <LottieDisplay />
 * </Lottie>
 * ```
 *
 * `ref` names the element either way. Commands go through `lottieRef`, and
 * anything the animation reports comes back through `subscriptions`.
 *
 * This is the full build, so every renderer is available. Reach for
 * `LottieSvg` instead when only `svg` is needed, or `LottieLight` when the
 * animation uses no expressions either: each carries a smaller copy of the
 * engine.
 */
export const Lottie = createLottieComponent<LottieRenderer>(fullEngine);
