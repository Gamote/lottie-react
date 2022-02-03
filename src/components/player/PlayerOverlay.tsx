import React, { DetailedHTMLProps, FC, HTMLAttributes, useEffect, useState } from "react";
import "./PlayerOverlay.less";
import useStateWithPrevious from "../../hooks/useStateWithPrevious";
import { useTimeout } from "../../hooks/useTimeout";

export type PlayerOverlayProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  show: boolean;
  /**
   * Minimum time to display the loading screen, helpful when the loading
   * is really fast, and we want to avoid the blinking effect
   *
   * Value in milliseconds, default 0
   */
  minShowTime?: number | null;
  /**
   * Time of the fadeout animation
   *
   * Value milliseconds, default 600
   */
  fadeOutAnimationTime?: number | null;
};

/**
 * Wrap children components within an absolute div with center alignment
 *
 * TODO: remove all styling for when user is specifying the content
 */
export const PlayerOverlay: FC<PlayerOverlayProps> = ({
  children,
  show: _shouldShow,
  minShowTime = 0,
  fadeOutAnimationTime = 600,
  style,
  ...rest
}) => {
  const {
    previousState: previousShouldShow,
    state: shouldShow,
    setState: setShouldShow,
  } = useStateWithPrevious({ initialState: _shouldShow });
  const [show, setShow] = useState(_shouldShow);

  /**
   * Listen for the `_shouldShow` changes and update any dependent state
   */
  useEffect(() => {
    setShouldShow((prevState) => {
      // Skip update if equal
      if (_shouldShow === prevState) {
        return prevState;
      }

      // If we should show after it was hidden, set the internal show to `true`
      if (_shouldShow) {
        setShow(true);
      }

      return _shouldShow;
    });
  }, [_shouldShow, setShouldShow]);

  /**
   * Start the timeout on mount
   */
  const { isReady, set } = useTimeout(() => {
    // Hide the overlay if the timeout is done and there's no animation
    if (!fadeOutAnimationTime) {
      onAnimationEnd();
    }
  }, minShowTime ?? 100);

  /**
   * Restart the timer when `shouldShow` became `true` from `false`
   */
  useEffect(
    () => {
      // If we need to show the overlay, it was hidden before and a minimum show
      // timeout time was specified, set the timeout unless it's not pending already
      if (shouldShow && shouldShow !== previousShouldShow && minShowTime && isReady !== false) {
        set();
      } else if (!shouldShow && show && !fadeOutAnimationTime && isReady !== false) {
        onAnimationEnd();
      }
    },

    // * We are disabling the `exhaustive-deps` here because we want to
    // * (re)initialise only when the `shouldShow` value change
    // ! DON'T CHANGE because we will end up having the "Maximum update depth exceeded" error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shouldShow],
  );

  /**
   * Hide the overlay if we shouldn't display it
   */
  const onAnimationEnd = () => {
    if (!shouldShow) {
      setShow(false);
    }
  };

  return show ? (
    <div
      {...rest}
      style={{
        position: "absolute",
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007A87",
        zIndex: 3,
        ...style,
        animation:
          fadeOutAnimationTime && isReady !== false
            ? `player-overlay-fade-${shouldShow ? "" : "out"} ${fadeOutAnimationTime / 1000}s`
            : undefined,
      }}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  ) : null;
};
