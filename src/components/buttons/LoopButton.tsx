import React, { FC } from "react";
import config from "../../config";
import SvgButton, { SvgButtonProps } from "./SvgButton";

type LoopButtonProps = SvgButtonProps & {
  isOn?: boolean | number;
};

// TODO: add support for numbers on `isOn` (for how many times)
const LoopButton: FC<LoopButtonProps> = ({ isOn, onClick }) => (
  <SvgButton onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      <path
        d="M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z"
        fill={!isOn ? "#ffffff" : config.accentColor}
      />
    </svg>
  </SvgButton>
);

export default LoopButton;
