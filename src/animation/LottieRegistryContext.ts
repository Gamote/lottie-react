import { createContext } from "react";
import type { LottieInstance } from "./types.js";

/**
 * A live pointer to one animation, stable for as long as the animation lives.
 *
 * The instance object is rebuilt every render, so anything that held it
 * directly would be holding the past one render later. A box is registered
 * once and read at the moment of use instead.
 */
export interface LottieInstanceBox {
  current: LottieInstance;
}

/**
 * What a surrounding wrapper offers the animations inside it: a place to
 * announce themselves, and a way to say their values moved.
 *
 * Context flows down and the data flows up through the `register` call, which
 * is what lets a wrapper drive animations it did not render itself.
 */
export interface LottieRegistry {
  /** Adds one animation. Returns the function that takes it out again. */
  register: (box: LottieInstanceBox) => () => void;
  /** Announces that a registered animation's values changed. */
  bump: () => void;
}

/** The registry with its readable half, which is the wrapper's own side. */
export interface LottieRegistryStore extends LottieRegistry {
  /** The animations registered right now. */
  boxes: () => readonly LottieInstanceBox[];
  /** Listens for registrations, removals and bumps, all as one signal. */
  subscribe: (listener: () => void) => () => void;
}

export function createLottieRegistry(): LottieRegistryStore {
  const entries = new Set<LottieInstanceBox>();
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    register(box) {
      entries.add(box);
      emit();
      return () => {
        entries.delete(box);
        emit();
      };
    },
    bump: emit,
    boxes: () => [...entries],
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * How an animation reaches whatever wrapper surrounds it, and `null` in the
 * common case where nothing does, which costs the animation one context read
 * and two no-op effects.
 */
export const LottieRegistryContext = createContext<LottieRegistry | null>(null);
