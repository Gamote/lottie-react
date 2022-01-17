import React, { FC } from "react";
import config from "../../../config";
import { SvgButton, SvgButtonProps } from "../../misc/SvgButton";

export type FullScreenButtonProps = SvgButtonProps & {
  isFullScreen?: boolean;
};

export const FullScreenButton: FC<FullScreenButtonProps> = ({ isFullScreen, onClick }) => (
  <SvgButton onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      {isFullScreen ? (
        <path
          d="M18 3h2v4h4v2h-6v-6zm6 12v2h-4v4h-2v-6h6zm-18 6h-2v-4h-4v-2h6v6zm-6-12v-2h4v-4h2v6h-6z"
          fill={config.accentColor}
        />
      ) : (
        <path
          d="M24 9h-2v-4h-4v-2h6v6zm-6 12v-2h4v-4h2v6h-6zm-18-6h2v4h4v2h-6v-6zm6-12v2h-4v4h-2v-6h6z"
          fill={config.whiteColor}
        />
      )}
    </svg>
  </SvgButton>
);
