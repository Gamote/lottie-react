import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";

export type PlayerContainerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const PlayerContainer: FC<PlayerContainerProps> = (props) => {
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
