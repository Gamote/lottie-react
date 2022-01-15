import React, { CSSProperties, FC, useEffect, useRef } from "react";
import { LottieEvent, LottieHookResult } from "../../types";

export type PlayerFramesIndicatorProps = Pick<LottieHookResult, "totalFrames" | "eventSubscriber">;

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
  eventSubscriber,
  totalFrames,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const frameSpanMinWidth = 15 + String(totalFrames).length * 5;

  /**
   * Listen for event regarding the `currentFrame`
   */
  useEffect(() => {
    if (eventSubscriber) {
      return eventSubscriber(LottieEvent.Frame, ({ currentFrame }) => {
        if (containerRef.current) {
          containerRef.current.innerText = currentFrame?.toFixed(0);
        }
      });
    }
  }, [eventSubscriber]);

  return (
    <div style={styles.container}>
      <span
        ref={containerRef}
        style={{
          ...styles.frameSpan,
          minWidth: frameSpanMinWidth,
        }}
      >
        0
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
