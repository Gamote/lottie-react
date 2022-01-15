import React, { FC } from "react";
import PlayerOverlay from "./PlayerOverlay";

export type PlayerErrorProps = {
  show: boolean;
  ErrorComponent?: JSX.Element;
};

/**
 * Component that is displayed when the player is in the Error state
 */
export const PlayerFailure: FC<PlayerErrorProps> = ({ show, ErrorComponent }) => {
  if (!show) {
    return null;
  }

  if (ErrorComponent) {
    return ErrorComponent;
  }

  return <PlayerOverlay>Couldn&apos;t load the animation</PlayerOverlay>;
};
