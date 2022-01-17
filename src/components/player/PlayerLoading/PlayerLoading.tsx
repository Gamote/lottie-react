import "./PlayerLoading.less";
import React, { FC } from "react";
import config from "../../../config";
import { PlayerOverlay } from "../PlayerOverlay";

export type PlayerLoadingProps = {
  show: boolean;
  Component?: JSX.Element;
  Content?: JSX.Element;
  color?: string;
  size?: number;
};

/**
 * Component that is displayed when the player is in the Loading state
 */
export const PlayerLoading: FC<PlayerLoadingProps> = ({
  show,
  Component,
  Content,
  color = config.whiteColor,
  size = 80,
}) => {
  if (!show) {
    return null;
  }

  if (Component) {
    return Component;
  }

  const circles = [...Array(2).keys()].map((_, index) => (
    <div
      key={index}
      style={{
        borderColor: `${color}`,
        borderWidth: size * 0.05,
      }}
    />
  ));

  return (
    <PlayerOverlay>
      {Content ? (
        Content
      ) : (
        <div className={"player-loading-spinner"} style={{ width: size, height: size }}>
          {circles}
        </div>
      )}
    </PlayerOverlay>
  );
};
