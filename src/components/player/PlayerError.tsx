import React, { FC } from "react";
import PlayerOverlay from "./PlayerOverlay";

export type PlayerErrorProps = {
  ErrorComponent?: JSX.Element;
};

/**
 * Component that is displayed when the player is in the Error state
 */
export const PlayerError: FC<PlayerErrorProps> = ({ ErrorComponent }) => {
  if (ErrorComponent) {
    return ErrorComponent;
  }

  return <PlayerOverlay>Couldn&apos;t load the animation</PlayerOverlay>;
};
