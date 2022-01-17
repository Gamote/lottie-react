import React, { FC } from "react";
import { Direction } from "../../../@types";
import config from "../../../config";
import { SvgButton, SvgButtonProps } from "../../misc/SvgButton";

export type DirectionButtonProps = SvgButtonProps & {
  direction?: Direction;
};

export const DirectionButton: FC<DirectionButtonProps> = ({
  direction = Direction.Right,
  onClick,
}) => (
  <SvgButton onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      <path
        d="M11 6v8h7v-2h-5v-6h-2zm-8.4 9.397l-1.799.906c-.302-.784-.521-1.607-.652-2.46l1.998-.159c.1.59.253 1.162.453 1.713zm4.393 7.501l.669-1.899c-.549-.265-1.068-.577-1.555-.933l-1.413 1.443c.708.545 1.478 1.012 2.299 1.389zm-5.319-4.795c.44.741.956 1.43 1.539 2.058l1.404-1.433c-.431-.471-.814-.982-1.149-1.528l-1.794.903zm10.322-18.103c-2.79 0-5.349.964-7.385 2.562l-2.183-2.183-1.356 7.013 7.015-1.354-2.05-2.049c1.666-1.245 3.724-1.989 5.959-1.989 5.516 0 10.003 4.486 10.003 10s-4.487 10-10.003 10c-.848 0-1.668-.118-2.455-.317l-.665 1.894c.996.267 2.039.423 3.12.423 6.629 0 12.004-5.373 12.004-12s-5.375-12-12.004-12zm-11.996 11.849l2.015-.161c.027-.703.125-1.386.288-2.047h-2.076c-.142.714-.217 1.453-.227 2.208z"
        fill={direction === Direction.Right ? config.whiteColor : config.accentColor}
      />
    </svg>
  </SvgButton>
);
