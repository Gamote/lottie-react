import React, { ChangeEventHandler, CSSProperties, MouseEventHandler, useState } from "react";
import isFunction from "../../utils/isFunction";

export type ProgressBarProps = {
  currentFrame?: number;
  totalFrames?: number;
  onChange?: (progress: number, isDraggingEnded?: boolean) => void;
};

const styles: Record<string, CSSProperties> = {
  frameBox: {
    padding: "2px 2px",
    minWidth: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
};

const ProgressBar = (props: ProgressBarProps) => {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const { totalFrames, currentFrame, onChange } = props;
  const _currentFrame = currentFrame ?? 0;
  const _totalFrames = totalFrames ?? 0;
  const isListeningForChanges = isFunction(onChange);

  const frameBoxMinWidth = 15 + String(_totalFrames).length * 5;

  /**
   * Handle any changes
   * @param event
   */
  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newFrame = Number(event.target.value);

    if (isListeningForChanges) {
      setSelectedFrame(newFrame);
      onChange?.(newFrame);
    }
  };

  /**
   * Handle the last change
   */
  const onMouseUpHandler: MouseEventHandler<HTMLInputElement> = () => {
    if (isListeningForChanges && selectedFrame !== null) {
      onChange?.(selectedFrame, true);
      setSelectedFrame(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          background: "#3f3f3f",
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
            minWidth: frameBoxMinWidth,
          }}
        >
          {_currentFrame?.toFixed(0)}
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
            minWidth: frameBoxMinWidth,
          }}
        >
          {_totalFrames}
        </span>
      </div>

      <input
        type="range"
        style={{
          width: "100%",
        }}
        onChange={onChangeHandler}
        onMouseUp={onMouseUpHandler}
        min={0}
        max={_totalFrames}
        step={0.001}
        value={_currentFrame}
      />

      {/*<div style={{ display: "flex", justifyContent: "space-between" }}>*/}
      {/*  <span*/}
      {/*    style={{*/}
      {/*      ...styles.frameBox,*/}
      {/*      left: 10,*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    {_currentFrame?.toFixed(0)}*/}
      {/*  </span>*/}
      {/*  <span*/}
      {/*    style={{*/}
      {/*      ...styles.frameBox,*/}
      {/*      right: 10,*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    {_totalFrames}*/}
      {/*  </span>*/}
      {/*</div>*/}
    </div>
  );
};

export default ProgressBar;
