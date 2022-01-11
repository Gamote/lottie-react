import React, { CSSProperties, FC } from "react";

type PlayerFrameIndicatorProps = {
  currentFrame: number;
  totalFrames: number;
};

const styles: Record<string, CSSProperties> = {
  frameBox: {
    padding: "2px 2px",
    minWidth: 30,
    height: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
};

/**
 * Show the current frame and the total
 */
const PlayerFrameIndicator: FC<PlayerFrameIndicatorProps> = ({ currentFrame, totalFrames }) => {
  const indicatorMinWidth = 15 + String(totalFrames).length * 5;

  return (
    <div
      style={{
        display: "flex",
        background: "rgb(77 77 77)",
        fontSize: 12,
        fontWeight: "500",
        color: "white",
        justifyContent: "center",
        borderRadius: 3,
      }}
    >
      <span
        style={{
          ...styles.frameBox,
          minWidth: indicatorMinWidth,
        }}
      >
        {currentFrame?.toFixed(0)}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        /
      </span>
      <span
        style={{
          ...styles.frameBox,
          minWidth: indicatorMinWidth,
        }}
      >
        {totalFrames}
      </span>
    </div>
  );
};

export default PlayerFrameIndicator;
