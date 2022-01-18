import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef } from "react";
import { UseLottieFactoryResult, LottieSubscription } from "../../@types";
import config from "../../config";

export type PlayerFramesIndicatorProps = Pick<
  UseLottieFactoryResult,
  "totalFrames" | "subscribe"
> & {
  decimals?: number;
};

const styles: Record<string, CSSProperties> = {
  container: {
    display: "flex",
    background: config.darkBackgroundColor,
    fontSize: config.textFontSize,
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
  subscribe,
  totalFrames,
  decimals,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const _decimals = useMemo(() => decimals ?? 0, [decimals]);
  const getFrameSpanMinWidth = useCallback((numberLength: number) => 15 + numberLength * 7, []);

  /**
   * Listen for event regarding the `currentFrame`
   */
  useEffect(() => {
    if (subscribe) {
      return subscribe(LottieSubscription.Frame, ({ currentFrame }) => {
        if (containerRef.current) {
          containerRef.current.innerText = currentFrame?.toFixed(_decimals);
        }
      });
    }
  }, [_decimals, subscribe]);

  return (
    <div style={styles.container}>
      <span
        ref={containerRef}
        style={{
          ...styles.frameSpan,
          minWidth: getFrameSpanMinWidth(
            String(totalFrames).length + (_decimals ? _decimals + 1 : 0),
          ),
        }}
      >
        0
      </span>

      <span style={styles.delimiterSpan}>/</span>

      <span
        style={{
          ...styles.frameSpan,
          minWidth: getFrameSpanMinWidth(String(totalFrames).length),
        }}
      >
        {totalFrames}
      </span>
    </div>
  );
};
