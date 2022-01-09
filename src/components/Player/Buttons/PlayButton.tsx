import React, { FC } from "react";
import config from "../../../config";
import SvgButton, { SvgButtonProps } from "./SvgButton";

const PlayButton: FC<SvgButtonProps> = ({ onClick }) => (
  <SvgButton onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M2 24v-24l20 12-20 12z" fill={config.whiteColor} />
    </svg>
  </SvgButton>
);

export default PlayButton;
