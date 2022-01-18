import React, { FC } from "react";
import config from "../../../config";
import { BaseButton, BaseButtonProps } from "../../misc/BaseButton";

export const PauseButton: FC<Pick<BaseButtonProps, "onClick">> = ({ onClick }) => (
  <BaseButton onClick={onClick}>
    <svg width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z" fill={config.whiteColor} />
    </svg>
  </BaseButton>
);
