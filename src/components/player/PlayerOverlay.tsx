import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";
import "./PlayerOverlay.less";
import { useFade } from "../../hooks/useFade";

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
  show: shouldShow,
  minShowTime = 3000, // TODO: set it to 0
  fadeOutAnimationTime = 600, // TODO: set it to 600
  style,
  ...rest
}) => {
  const { isVisible, fadeProps } = useFade({
    shouldShow,
    fadeOutTime: fadeOutAnimationTime,
    minimumDisplayTime: minShowTime,
  });

  return isVisible ? (
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
        ...fadeProps.style,
      }}
      onAnimationEnd={fadeProps.onAnimationEnd}
    >
      {children}
    </div>
  ) : null;
};
