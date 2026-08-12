import type { LottieInstance } from "../animation/types.js";
import type { LottieInteraction } from "./types.js";
import {
  useInteractionsRunner,
  useSingleInstanceSource,
} from "./useInteractionsRunner.js";

/**
 * Attaches behaviours to one animation on the hook path.
 *
 * ```jsx
 * const lottie = useLottie({ src, autoplay: false });
 * useLottieInteractions(lottie, [lottieScrollScrub({ range: [0.2, 0.45] })]);
 * ```
 *
 * The list is safe to write inline: implementations compare by identity and
 * options by content, so a fresh array every render re-arms nothing, and a
 * changed option re-arms only its own behaviour. The same runner serves
 * `<LottieInteractions>`, so the two paths cannot drift.
 */
export function useLottieInteractions(
  lottie: LottieInstance,
  interactions: readonly LottieInteraction[],
): void {
  const single = useSingleInstanceSource(lottie);
  useInteractionsRunner(single, interactions);
}
