import React, { DetailedHTMLProps, FC, HTMLAttributes, useEffect, useState } from "react";
import "./PlayerOverlay.less";

export type PlayerOverlayProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  show: boolean;
  /**
   * In milliseconds, default 100
   */
  minDisplayTime?: number | null;
  /**
   * In milliseconds, default 300
   */
  fadeOutTime?: number | null;
};

/**
 * Wrap children components within an absolute div with center alignment
 */
export const PlayerOverlay: FC<PlayerOverlayProps> = ({
  children,
  show: shouldShow,
  minDisplayTime = 100,
  fadeOutTime = 600, // ! TODO: doesn't work with `0`
  style,
  ...rest
}) => {
  const [show, setShow] = useState(shouldShow);
  const [timeoutElapsed, setTimeoutElapsed] = useState(!minDisplayTime);

  // TODO: restart the timeout when the `shouldShow` change
  useEffect(() => {
    if (!minDisplayTime) {
      setTimeoutElapsed(true);
      return;
    }

    const _timeout = setTimeout(() => setTimeoutElapsed(true), minDisplayTime);

    return () => {
      clearTimeout(_timeout);
    };
  }, [minDisplayTime]);

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
        // TODO: think about `fadeInTime` for when you change between animation files
        animation: fadeOutTime
          ? `player-overlay-fade-${!shouldShow && timeoutElapsed ? "out" : ""} ${
              fadeOutTime / 1000
            }s`
          : undefined,
      }}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  ) : null;
};
