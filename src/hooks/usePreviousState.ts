import { useEffect, useRef } from "react";

/**
 * Custom hook for getting previous value
 * @param value
 */
const usePreviousState = <T = unknown>(value: T) => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

export default usePreviousState;
