import type { LottieInstance } from "../animation/types.js";

/**
 * What a behaviour is handed when it attaches to one animation.
 *
 * Everything here reads live. `lottie` is the animation as it is right now,
 * never a captured copy, because the instance object is rebuilt every render
 * and anything held across renders would be the past. `options` is the same
 * for the descriptor's options, which is how a callback option is read fresh
 * at the moment an event fires without the behaviour ever re-attaching.
 */
export interface LottieInteractionContext {
  /** The animation: values, commands, `subscribe`, `root`. Read fresh each use. */
  readonly lottie: LottieInstance;
  /** The descriptor's options as they are right now. */
  options: () => unknown;
  /**
   * Fires when something about the animation changed: its root arrived, its
   * values moved, or its options were edited. A behaviour re-checks what it
   * armed against and returns early when nothing it uses has changed.
   */
  onChange: (listener: () => void) => () => void;
  /**
   * Scratch that survives an option change, for state that must outlive the
   * re-attach an option change causes: a once-latch is the worked example.
   * Cleared when the interaction leaves the list or everything unmounts.
   */
  memory: Record<string, unknown>;
}

/**
 * One behaviour in an `interactions` list: a stable implementation plus the
 * plain data it was configured with. Factories such as `lottieInView` make
 * these; nothing else needs to.
 *
 * The split is load-bearing. Implementations compare by identity and options
 * by content, so a list written inline at the call site re-arms nothing, and
 * an option that really changed re-arms only its own behaviour. `attach`
 * narrows `options` itself with its own guard and returns the cleanup that
 * detaches, or nothing when there was nothing to attach.
 */
export interface LottieInteraction {
  attach: (
    context: LottieInteractionContext,
    options: unknown,
  ) => (() => void) | undefined;
  options: unknown;
}
