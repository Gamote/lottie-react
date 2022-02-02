import { useEffect, useRef } from "react";

/**
 * Use state that is not trigger a rerender
 * @param value
 */
const useNonReactiveState = <T = unknown>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default useNonReactiveState;
