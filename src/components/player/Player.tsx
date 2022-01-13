import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";

export type PlayerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Player: FC<PlayerProps> = (props) => {
  const { children, ...rest } = props;

  return (
    <div
      {...rest}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        ...rest.style,
      }}
    >
      {children}
    </div>
  );
};

export default Player;
