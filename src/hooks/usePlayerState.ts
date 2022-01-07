import { useEffect, useState } from "react";
import isFunction from "../utils/isFunction";
import { LottiePlayerState } from "./useLottiePlayer";
import usePreviousState from "./usePreviousState";

type PlayerStateHookOptions = {
  initialState: LottiePlayerState;
  onChange?: (
    previousPlayerState: undefined | LottiePlayerState,
    newPlayerState: LottiePlayerState,
  ) => void;
};

const usePlayerState = (options?: PlayerStateHookOptions) => {
  const { initialState, onChange } = options ?? {};

  if (!initialState) {
    throw new Error(
      `Please specify the "options.initialState" when you use the "usePlayerState" hook.`,
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

export default usePlayerState;
