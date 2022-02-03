import { useCallback, useEffect, useRef, useState } from "react";

export type UseTimeoutFnReturn = {
  isReady: boolean | null;
  set: () => void;
  clear: () => void;
};

export const useTimeout = (fn: () => void, ms = 0): UseTimeoutFnReturn => {
  const [isReady, setIsReady] = useState<boolean | null>(ms ? false : null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const set = useCallback(() => {
    if (!ms) {
      return;
    }

    setIsReady(false);
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setIsReady(true);
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    setIsReady(null);
    timeout.current && clearTimeout(timeout.current);
  }, []);

  // update ref when function changes
  useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // set on mount, clear on unmount
  useEffect(
    () => {
      set();

      return clear;
    },

    // * We are disabling the `exhaustive-deps` here because we want to
    // * (re)initialise only when the `ms` value change
    // ! DON'T CHANGE because we will end up having the "Maximum update depth exceeded" error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ms],
  );

  return { isReady, clear, set };
};
