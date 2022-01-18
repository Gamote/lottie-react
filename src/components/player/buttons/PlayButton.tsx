import React, { FC } from "react";
import config from "../../../config";
import { BaseButton, BaseButtonProps } from "../../misc/BaseButton";

export const PlayButton: FC<Pick<BaseButtonProps, "onClick">> = ({ onClick }) => (
  <BaseButton onClick={onClick}>
    <svg width="100%" height="100%" viewBox="0 0 24 24">
      <path d="M2 24v-24l20 12-20 12z" fill={config.whiteColor} />
    </svg>
  </BaseButton>
);
