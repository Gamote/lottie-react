import React, { FC } from "react";
import config from "../../../config";
import { SvgButton, SvgButtonProps } from "../../misc/SvgButton";

export type DirectionButtonProps = SvgButtonProps & {
  direction?: "right" | "left";
};

export const DirectionButton: FC<DirectionButtonProps> = ({ direction = "right", onClick }) => (
  <SvgButton onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      {direction === "right" ? (
        <path d="M13 7v-6l11 11-11 11v-6h-13v-10z" fill={config.whiteColor} />
      ) : (
        <path d="M11,17v6L0,12,11,1V7H24V17Z" fill={config.whiteColor} />
      )}
    </svg>
  </SvgButton>
);
