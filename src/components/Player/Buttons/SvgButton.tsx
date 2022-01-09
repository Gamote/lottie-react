import React, { FC } from "react";

export type SvgButtonProps = {
  onClick?: () => void;
};

const SvgButton: FC<SvgButtonProps> = ({ children, onClick }) => (
  <div
    style={{
      background: "rgb(77 77 77)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
      width: 30,
      height: 25,
      borderRadius: 3,
    }}
    onClick={onClick}
  >
    {children}
  </div>
);

export default SvgButton;
