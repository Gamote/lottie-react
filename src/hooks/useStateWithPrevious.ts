import { useEffect, useState } from "react";
import isFunction from "../utils/isFunction";
import useNonReactiveState from "./useNonReactiveState";

export type UseStateWithPrevious<State = unknown> = {
  initialState: State;
  onChange: (previousState: undefined | State, newState: State) => void;
};

/**
 * Hook that handle a state and remembers a previous value
 * @param options
 */
const useStateWithPrevious = <State = unknown>(options?: UseStateWithPrevious<State>) => {
  const { initialState, onChange } = options ?? {};

  if (!initialState) {
    throw new Error(
      `Please specify the "options.initialState" when you use the "useStateWithPrevious" hook.`,
    );
  }

  const [state, setState] = useState<State>(initialState);
  const previousState = useNonReactiveState(state);

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

export default useStateWithPrevious;
