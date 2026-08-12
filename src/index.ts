/*
 * The public surface: a symbol is public exactly when it is exported here.
 * Every export carries the `Lottie` prefix, hooks carry `useLottie`, and the
 * sections mirror the folder order under `src/`. Types are free to widen later;
 * removing or reshaping anything here is breaking.
 */

// The animation: components, hooks, and the vocabulary they share.
export { Lottie, type LottieProps } from "./animation/Lottie.js";
export {
  LottieDisplay,
  type LottieDisplayProps,
} from "./animation/LottieDisplay.js";
export { LottieLight, type LottieLightProps } from "./animation/LottieLight.js";
export {
  LottieDirection,
  type LottieHandle,
  type LottieInstance,
  LottieRenderer,
  type LottieSeekTarget,
  type LottieSegments,
  LottieState,
  LottieSubscription,
  type LottieSubscriptions,
} from "./animation/types.js";
export { useLottie } from "./animation/useLottie.js";
export type { UseLottieOptions } from "./animation/useLottieAnimation.js";
export { useLottieInstance } from "./animation/useLottieInstance.js";
export { useLottieLight } from "./animation/useLottieLight.js";

// The control bar. Its parts are deliberately not public.
export {
  LottieControls,
  type LottieControlsProps,
} from "./controls/LottieControls.js";

// Interactions: the component, the hook, the factories, and the contract a
// factory of your own implements.
export {
  LottieInteractions,
  type LottieInteractionsProps,
} from "./interactions/LottieInteractions.js";
export {
  type LottieInViewOptions,
  lottieInView,
} from "./interactions/lottieInView.js";
export {
  type LottieScrollScrubOptions,
  lottieScrollScrub,
} from "./interactions/lottieScrollScrub.js";
export type {
  LottieInteraction,
  LottieInteractionContext,
} from "./interactions/types.js";
export { useLottieInteractions } from "./interactions/useLottieInteractions.js";

// The overlays.
export { LottieError, type LottieErrorProps } from "./overlays/LottieError.js";
export {
  LottieLoading,
  type LottieLoadingProps,
} from "./overlays/LottieLoading.js";
