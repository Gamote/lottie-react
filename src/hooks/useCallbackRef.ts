import { useCallback, useState } from "react";
import { CallbackRefHookResult } from "../types";

/**
 * Ref that rerender on change
 * TODO: check if it's the MOST efficient way to do it
 * @param initialValue
 */
const useCallbackRef = <T = unknown>(initialValue?: T): CallbackRefHookResult<T> => {
  const [current, setCurrent] = useState<T | null>(initialValue ?? null);

  const setRef = useCallback<(node: T) => void>((node) => {
    setCurrent(node);
  }, []);

  return { ref: { current }, setRef };
};

export default useCallbackRef;
