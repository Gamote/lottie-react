import { useEffect, useState } from "react";
import { LottiePlayerState, LottiePlayerStateHookOptions } from "../types";
import isFunction from "../utils/isFunction";
import usePreviousState from "./usePreviousState";

/**
 * Hook that handle the state for LottiePlayer
 * @param options
 */
const useLottiePlayerState = (options?: LottiePlayerStateHookOptions) => {
  const { initialState, onChange } = options ?? {};

  if (!initialState) {
    throw new Error(
      `Please specify the "options.initialState" when you use the "useLottiePlayerState" hook.`,
    );
  }

  const [playerState, setPlayerState] = useState<LottiePlayerState>(initialState);
  const previousPlayerState = usePreviousState(playerState);

  useEffect(() => {
    if (onChange && isFunction(onChange)) {
      onChange(previousPlayerState, playerState);
    }
  }, [onChange, playerState, previousPlayerState]);

  return {
    previousPlayerState, // TODO: test initial value
    playerState,
    setPlayerState,
  };
};

export default useLottiePlayerState;
