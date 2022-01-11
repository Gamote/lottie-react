import { useEffect, useState } from "react";
import { LottieState, LottiePlayerStateHookOptions } from "../types";
import isFunction from "../utils/isFunction";
import usePreviousState from "./usePreviousState";

/**
 * Hook that handle the state for LottiePlayer
 * @param options
 */
const useLottieState = (options?: LottiePlayerStateHookOptions) => {
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
    previousState, // TODO: test initial value
    state,
    setState,
  };
};

export default useLottieState;
