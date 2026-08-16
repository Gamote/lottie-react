"use client";

import { LottieState } from "../animation/types.js";
import type { LottieInteraction, LottieInteractionContext } from "./types.js";

/** What {@link lottieInView} can be told. */
export interface LottieInViewOptions {
  /**
   * Play on the first entry and then stop watching for good, so scrolling
   * past again replays nothing. Off unless asked for.
   */
  once?: boolean;
  /**
   * How much of the animation must be visible to count as entered, `0` to
   * `1`. The default is `0`: a single visible pixel. `1` is accepted and
   * warned about, because an element taller than the viewport can never be
   * entirely visible, so a threshold of one silently never fires for it.
   */
  amount?: number;
  /**
   * Grows or shrinks the viewport the entry is measured against, in the
   * platform's own `rootMargin` grammar: px or % only.
   */
  margin?: string;
}

function isInViewOptions(value: unknown): value is LottieInViewOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if ("once" in value && typeof value.once !== "boolean") {
    return false;
  }
  if ("amount" in value && typeof value.amount !== "number") {
    return false;
  }
  return !("margin" in value && typeof value.margin !== "string");
}

/** Whether a play command would fight something that outranks it. */
function playable(state: LottieState): boolean {
  return (
    state !== LottieState.loading &&
    state !== LottieState.error &&
    state !== LottieState.frozen
  );
}

function attachInView(
  context: LottieInteractionContext,
  raw: unknown,
): (() => void) | undefined {
  const options = isInViewOptions(raw) ? raw : {};

  let observer: IntersectionObserver | null = null;
  let observedRoot: HTMLElement | null = null;
  let playedByUs = false;
  let previousState = context.lottie.state;
  let lastIntersecting: boolean | null = null;

  /*
   * Autoplay and an in-view trigger together leave the trigger nothing to
   * start. Autoplay shows itself as the animation reaching `playing` straight
   * out of `loading` without this trigger's doing, or as being mid-play the
   * moment this arms; a person pressing play arrives from `stopped` and is
   * not warned about.
   */
  const warnRedundant = () => {
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      if (
        context.memory.warnedRedundant !== true &&
        !playedByUs &&
        context.lottie.state === LottieState.playing
      ) {
        context.memory.warnedRedundant = true;
        console.warn(
          "[lottie-react] an in-view trigger is watching an animation that already plays by itself. " +
            "With autoplay on, the trigger has nothing left to start; drop one of the two.",
        );
      }
    }
  };

  /*
   * The play is what spends the `once` latch and stops the watching, never a
   * refused entry, so an entry arriving while the animation still loads
   * cannot use the one chance up. The latch lives in `memory`, so changing
   * another option, which re-attaches, cannot make a once-played animation
   * play again.
   */
  const playFromEntry = () => {
    if (options.once === true) {
      context.memory.entered = true;
      observer?.disconnect();
      observer = null;
    }
    playedByUs = true;
    context.lottie.play();
  };

  const handleEntries: IntersectionObserverCallback = (entries) => {
    const entry = entries.at(-1);
    if (entry === undefined) {
      return;
    }
    lastIntersecting = entry.isIntersecting;
    const lottie = context.lottie;
    if (entry.isIntersecting) {
      if (options.once === true && context.memory.entered === true) {
        return;
      }
      if (playable(lottie.state)) {
        playFromEntry();
      }
    } else if (options.once !== true && lottie.state === LottieState.playing) {
      lottie.pause();
    }
  };

  const arm = () => {
    const root = context.lottie.root;
    if (root === observedRoot) {
      return;
    }
    observer?.disconnect();
    observer = null;
    observedRoot = root;
    if (root === null) {
      return;
    }
    if (options.once === true && context.memory.entered === true) {
      return;
    }

    try {
      observer = new IntersectionObserver(handleEntries, {
        threshold: options.amount ?? 0,
        rootMargin: options.margin,
      });
    } catch {
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          `[lottie-react] the margin ${JSON.stringify(options.margin)} was refused, so the trigger watches ` +
            "without it. A margin is written in px or %, the only lengths the platform accepts here.",
        );
      }
      observer = new IntersectionObserver(handleEntries, {
        threshold: options.amount ?? 0,
      });
    }
    observer.observe(root);
  };

  const stopListening = context.onChange(() => {
    const state = context.lottie.state;
    if (
      previousState === LottieState.loading &&
      state === LottieState.playing
    ) {
      warnRedundant();
    }
    /*
     * An entry that arrived during the load was refused as unplayable, and
     * the observer will not repeat it, so the load's completion acts on what
     * it last said. An animation already playing needs nothing, which also
     * keeps autoplay's redundancy warning able to fire.
     */
    if (
      previousState === LottieState.loading &&
      lastIntersecting === true &&
      playable(state) &&
      state !== LottieState.playing &&
      !(options.once === true && context.memory.entered === true)
    ) {
      playFromEntry();
    }
    previousState = state;
    arm();
  });
  warnRedundant();
  arm();

  return () => {
    stopListening();
    observer?.disconnect();
  };
}

/**
 * Plays the animation when it scrolls into view and pauses it when it leaves,
 * or with `once`, plays on the first entry and never again.
 *
 * ```jsx
 * <LottieInteractions interactions={[lottieInView({ once: true })]}>
 *   <Lottie src={anim} autoplay={false} />
 * </LottieInteractions>
 * ```
 *
 * An entry seen while the animation is still loading plays as soon as the
 * load finishes, so an animation already on screen at page load starts by
 * itself.
 *
 * Leaving pauses rather than stops, so coming back resumes mid-motion instead
 * of restarting. The trigger never overrides a load still in flight or a
 * failed one, and it cannot tell its own pause from one a person asked for,
 * so re-entering resumes either.
 */
export function lottieInView(
  options: LottieInViewOptions = {},
): LottieInteraction {
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    if (options.amount === 1) {
      console.warn(
        "[lottie-react] amount: 1 never fires for an animation taller than the viewport, because " +
          "such an element is never entirely visible. Use a smaller amount, or a negative margin " +
          "for a centre band.",
      );
    }
  }
  return { attach: attachInView, options };
}
