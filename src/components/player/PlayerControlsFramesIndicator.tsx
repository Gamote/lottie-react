import React, { CSSProperties, FC } from "react";

export type PlayerFramesIndicatorProps = {
  currentFrame: number;
  totalFrames: number;
};

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    background: "rgb(77 77 77)",
    fontSize: 12,
    fontWeight: "500",
    color: "white",
    justifyContent: "center",
    borderRadius: 3,
  },
  frameSpan: {
    padding: "2px 2px",
    minWidth: 30,
    height: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  delimiterSpan: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
};

/**
 * Show the current frame and the total
 */
export const PlayerControlsFramesIndicator: FC<PlayerFramesIndicatorProps> = ({
  currentFrame,
  totalFrames,
}) => {
  const frameSpanMinWidth = 15 + String(totalFrames).length * 5;

  return (
    <div style={styles.container}>
      <span
        style={{
          ...styles.frameSpan,
          minWidth: frameSpanMinWidth,
        }}
      >
        {currentFrame?.toFixed(0)}
      </span>
      <span style={styles.delimiterSpan}>/</span>
      <span
        style={{
          ...styles.frameSpan,
          minWidth: frameSpanMinWidth,
        }}
      >
        {totalFrames}
      </span>
    </div>
  );
};
