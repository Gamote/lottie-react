import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";

export type PlayerOverlayProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Add a div with padding to the left and right of `size` / 2
 */
export const PlayerOverlay: FC<PlayerOverlayProps> = ({ children, style, ...rest }) => (
  <div
    {...rest}
    style={{
      position: "absolute",
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,122,135,0.7)",
      zIndex: 1,
      ...style,
    }}
  >
    {children}
  </div>
);
