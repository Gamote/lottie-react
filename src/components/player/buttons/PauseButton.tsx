import React, { FC } from "react";
import config from "../../../config";
import SvgButton, { SvgButtonProps } from "../../misc/SvgButton";

const PauseButton: FC<SvgButtonProps> = ({ onClick }) => (
  <SvgButton onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z" fill={config.whiteColor} />
    </svg>
  </SvgButton>
);

export default PauseButton;
