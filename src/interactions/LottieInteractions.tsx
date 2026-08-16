"use client";

import { type ReactNode, useContext, useState } from "react";
import { LottieInstanceContext } from "../animation/LottieInstanceContext.js";
import {
  createLottieRegistry,
  LottieRegistryContext,
} from "../animation/LottieRegistryContext.js";
import type { LottieInstance } from "../animation/types.js";
import type { LottieInteraction } from "./types.js";
import {
  useInteractionsRunner,
  useSingleInstanceSource,
} from "./useInteractionsRunner.js";

/** What {@link LottieInteractions} owns. It renders no element of its own. */
export interface LottieInteractionsProps {
  /** The animation to drive. Omit it around or inside `<Lottie>`. */
  lottie?: LottieInstance;
  /** The behaviours, each made by a factory such as `lottieInView(...)`. */
  interactions: readonly LottieInteraction[];
  /** Anything at all, rendered untouched. */
  children?: ReactNode;
}

/**
 * Attaches behaviours to animations, from any of three positions.
 *
 * Around a `<Lottie>` it drives every animation inside it, however deep and
 * however many, with no display of its own to place. Inside a `<Lottie>` it
 * drives that animation. Handed a `lottie` from the hook path it drives
 * exactly that one, like every other component here.
 *
 * ```jsx
 * <LottieInteractions interactions={[lottieInView({ once: true })]}>
 *   <Lottie src={anim} autoplay={false} />
 * </LottieInteractions>
 * ```
 *
 * The resolution is the nearest claim wins: the `lottie` prop, else the
 * animation whose `<Lottie>` this sits inside, else whatever renders below.
 * When one of the first two wins, the children pass through untouched, so an
 * animation below still reaches a wrapper further out. Wrapping nothing is
 * not an error, because the animations inside may mount later; it simply
 * does nothing yet.
 */
export function LottieInteractions({
  lottie,
  interactions,
  children,
}: LottieInteractionsProps): ReactNode {
  const surrounding = useContext(LottieInstanceContext);
  const explicit = lottie ?? surrounding;

  const [store] = useState(createLottieRegistry);
  const single = useSingleInstanceSource(explicit);

  useInteractionsRunner(explicit !== null ? single : store, interactions);

  if (explicit !== null) {
    return children ?? null;
  }
  return (
    <LottieRegistryContext.Provider value={store}>
      {children}
    </LottieRegistryContext.Provider>
  );
}
