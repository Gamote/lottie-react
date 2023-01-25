import { useCallback, useEffect, useRef, useState } from "react";

export enum TimeoutState {
  NotSet = "not-set",
  Idle = "idle",
  InProgress = "in-progress",
}

export type UseTimeoutFnReturn = {
  status: TimeoutState;
  set: () => void;
  clear: () => void;
};

export const useTimeout = (ms: number, fn?: () => void): UseTimeoutFnReturn => {
  const [status, setStatus] = useState<TimeoutState>(ms ? TimeoutState.Idle : TimeoutState.NotSet);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const set = useCallback(() => {
    if (!ms) {
      return;
    }

    setStatus(TimeoutState.InProgress);
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setStatus(TimeoutState.Idle);
      callback.current?.();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    setStatus(TimeoutState.NotSet);
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

  return { status, clear, set };
};
