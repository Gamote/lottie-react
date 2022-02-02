import React, { FC } from "react";
import { PlayerOverlay } from "./PlayerOverlay";

export type PlayerErrorProps = {
  show: boolean;
  Component?: JSX.Element;
  Content?: JSX.Element;
};

/**
 * Component that is displayed when the player is in the Error state
 */
export const PlayerFailure: FC<PlayerErrorProps> = ({ show, Component, Content }) => {
  if (!show) {
    return null;
  }

  if (Component) {
    return Component;
  }

  return (
    <PlayerOverlay show={show}>{Content ? Content : "Couldn't load the animation"}</PlayerOverlay>
  );
};
