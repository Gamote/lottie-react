import React, { ChangeEventHandler, CSSProperties, MouseEventHandler, useState } from "react";
import isFunction from "../../utils/isFunction";

export type ProgressBarProps = {
  totalFrames: number;
  currentFrames: number;
  onChange?: (progress: number, isDraggingEnded?: boolean) => void;
};

// Styles
const inputContainerStyles: CSSProperties = {
  padding: 5,
};
const inputStyles: CSSProperties = {
  width: "100%",
};

const ProgressBar = (props: ProgressBarProps) => {
  const { totalFrames, currentFrames, onChange } = props;
  const isListeningForChanges = isFunction(onChange);
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

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
    <div style={inputContainerStyles}>
      <input
        type="range"
        style={inputStyles}
        onChange={onChangeHandler}
        onMouseUp={onMouseUpHandler}
        min={0}
        max={totalFrames}
        step={0.001}
        value={currentFrames}
        defaultValue={0}
      />
    </div>
  );
};

export default ProgressBar;
