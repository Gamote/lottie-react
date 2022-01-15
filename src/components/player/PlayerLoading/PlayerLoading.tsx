import "./PlayerLoading.less";
import React, { FC } from "react";
import PlayerOverlay from "../PlayerOverlay";

export type PlayerLoadingProps = {
  show: boolean;
  LoadingComponent?: JSX.Element;
  color?: string;
  size?: number;
};

/**
 * Component that is displayed when the player is in the Loading state
 */
export const PlayerLoading: FC<PlayerLoadingProps> = ({
  show,
  LoadingComponent,
  color = "#FFFFFF",
  size = 80,
}) => {
  if (!show) {
    return null;
  }

  if (LoadingComponent) {
    return LoadingComponent;
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
      <div className={"player-loading-spinner"} style={{ width: size, height: size }}>
        {circles}
      </div>
    </PlayerOverlay>
  );
};
