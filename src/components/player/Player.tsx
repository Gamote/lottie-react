import React, { DetailedHTMLProps, FC, HTMLAttributes } from "react";

/**
 * Properties for the `Player` component
 */
export type PlayerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Player container for Lottie's animation
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 */
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
