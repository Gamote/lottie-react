import React, { ChangeEventHandler, MouseEventHandler, useState } from "react";
import isFunction from "../../utils/isFunction";

export type ProgressBarProps = {
  currentFrame?: number;
  totalFrames?: number;
  onChange?: (progress: number, isDraggingEnded?: boolean) => void;
};

const ProgressBar = (props: ProgressBarProps) => {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const { totalFrames, currentFrame, onChange } = props;
  const _currentFrame = currentFrame ?? 0;
  const _totalFrames = totalFrames ?? 0;
  const isListeningForChanges = isFunction(onChange);

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
    <div style={{ flex: 1 }}>
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

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{_currentFrame?.toFixed(0)}</span>
        <span>{_totalFrames}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
