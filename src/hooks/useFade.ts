import { CSSProperties, useEffect, useState } from "react";
import useStateWithPrevious from "./useStateWithPrevious";
import { TimeoutState, useTimeout } from "./useTimeout";

type UseFadeProps = {
  shouldShow: boolean;
  fadeOutTime?: number | null;
  minimumDisplayTime?: number | null;
};

// TODO: handle the case in which the `fadeOutTime` is `null`, `undefined` or `0`
// TODO: handle the case in which the `minimumDisplayTime` is `null`, `undefined` or `0`
// TODO: handle the fade in case
// TODO: fade when switching from one to another
// TODO: find a way to define the @keyframes from here
export const useFade = ({ shouldShow, fadeOutTime, minimumDisplayTime }: UseFadeProps) => {
  const animationName = "player-overlay-fade-out";

  /**
   * This is an intermediate state to avoid, so we can delay the display state
   * of the component in case there are other factors that are delaying the fade out
   * like a minimum display time
   */
  const {
    previousState: previousShow,
    state: show,
    setState: setShow,
  } = useStateWithPrevious({ initialState: shouldShow });

  const [isVisible, setVisible] = useState(shouldShow);

  const { status: timeoutStatus, set } = useTimeout(minimumDisplayTime ?? 0);

  // Update internal state when `shouldShow` changes
  useEffect(() => {
    setShow((prevState) => {
      // Skip update if equal
      if (shouldShow === prevState) {
        return prevState;
      }

      // If `shouldShow` became `true` from `false`, we need to make the component visible
      if (shouldShow) {
        setVisible(true);
      }

      return shouldShow;
    });
  }, [shouldShow, setShow]);

  // Restart the timer when `show` became `true` from `false`
  useEffect(
    () => {
      // If we need to show the overlay, it was hidden before and a minimum show
      // timeout time was specified, set the timeout unless it's not pending already
      if (
        show &&
        show !== previousShow &&
        minimumDisplayTime &&
        timeoutStatus !== TimeoutState.InProgress
      ) {
        set();
      } else if (!show && isVisible && !fadeOutTime && timeoutStatus !== TimeoutState.InProgress) {
        // TODO: check this use case
        onAnimationEnd({ animationName });
      }
    },

    // * We are disabling the `exhaustive-deps` here because we want to
    // * (re)initialise only when the `show` value change
    // ! DON'T CHANGE because we will end up having the "Maximum update depth exceeded" error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [show],
  );

  const onAnimationEnd = (event: { animationName: string }) => {
    if (event.animationName === animationName && !show) {
      setVisible(false);
    }
  };

  const style: CSSProperties =
    show || !fadeOutTime || timeoutStatus === TimeoutState.InProgress
      ? {
          // Nothing for now
        }
      : {
          animationName,
          animationDuration: `${fadeOutTime}ms`,
          opacity: 0,
        };

  const fadeProps = {
    style,
    onAnimationEnd,
  };

  return { isVisible, fadeProps };
};
