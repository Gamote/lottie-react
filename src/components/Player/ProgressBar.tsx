import "./ProgressBar.less";
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
    <input
      className={"progress-bar"}
      type="range"
      style={{
        /**
         * Set the current progress percentage as a CSS var, so it can be used in the style
         * to properly customize the input range styling across browsers
         *
         * Source: https://toughengineer.github.io/demo/slider-styler/slider-styler.html
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "--min": 0,
        "--max": _totalFrames,
        "--value": _currentFrame,
      }}
      onChange={onChangeHandler}
      onMouseUp={onMouseUpHandler}
      min={0}
      max={_totalFrames}
      value={_currentFrame}
      step={0.001}
    />
  );
};

export default ProgressBar;
