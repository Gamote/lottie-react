import { useEffect, useState } from "react";
import isFunction from "../utils/isFunction";
import usePreviousState from "./usePreviousState";

/**
 * Enum with the Lottie's states
 */
export enum LottieState {
  Loading = "loading",
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Frozen = "frozen",
  Error = "error",
}

/**
 * Options for the `useLottieState()` hook
 */
export type LottieStateHookOptions = {
  initialState: LottieState;
  onChange?: (previousState: undefined | LottieState, newState: LottieState) => void;
};

/**
 * Hook that handle the state for LottiePlayer
 * @param options
 */
const useLottieState = (options?: LottieStateHookOptions) => {
  const { initialState, onChange } = options ?? {};

  if (!initialState) {
    throw new Error(
      `Please specify the "options.initialState" when you use the "useLottiePlayerState" hook.`,
    );
  }

  const [state, setState] = useState<LottieState>(initialState);
  const previousState = usePreviousState(state);

  useEffect(() => {
    if (onChange && isFunction(onChange)) {
      onChange(previousState, state);
    }
  }, [onChange, state, previousState]);

  return {
    previousState,
    state,
    setState,
  };
};

export default useLottieState;
