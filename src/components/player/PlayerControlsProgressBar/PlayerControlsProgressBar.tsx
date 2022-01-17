import "./PlayerControlsProgressBar.less";
import React, { ChangeEventHandler, MouseEventHandler, useEffect, useRef } from "react";
import { UseLottieFactoryResult, LottieSubscription } from "../../../@types";
import isFunction from "../../../utils/isFunction";

export type ProgressBarProps = Pick<UseLottieFactoryResult, "totalFrames" | "subscribe"> & {
  disabled?: boolean;
  onChange?: (progress: number, isDraggingEnded?: boolean) => void;
};

/**
 * Component that show the animation's progress and offer ways to
 * select a new frame from `0` to `totalFrames`
 */
export const PlayerControlsProgressBar = (props: ProgressBarProps) => {
  const containerRef = useRef<HTMLInputElement>(null);
  const { totalFrames, subscribe, disabled, onChange } = props;
  const _totalFrames = totalFrames ?? 0;
  const isListeningForChanges = isFunction(onChange);

  /**
   * Listen for event regarding the `currentFrame`
   */
  useEffect(() => {
    if (subscribe) {
      return subscribe(LottieSubscription.Frame, ({ currentFrame }) => {
        if (containerRef.current) {
          // Update the `value` of the input range
          containerRef.current.value = String(currentFrame);
          // Set the `--value` CSS value so the styling can adapt
          containerRef.current.style.setProperty("--value", `${currentFrame}`);
        }
      });
    }
  }, [subscribe]);

  /**
   * Handle any changes of the progress bar
   * @param event
   */
  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newFrame = Number(event.target.value);

    if (isListeningForChanges) {
      onChange?.(newFrame);
    }
  };

  /**
   * Handle mouse up on progress bar
   */
  const onMouseUpHandler: MouseEventHandler<HTMLInputElement> = () => {
    if (isListeningForChanges && containerRef.current) {
      onChange?.(Number(containerRef.current.value), true);
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <input
        ref={containerRef}
        disabled={disabled || !_totalFrames}
        className={"player-controls-progress-bar"}
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
          // "--value": 0,
        }}
        onChange={onChangeHandler}
        onMouseUp={onMouseUpHandler}
        min={0}
        max={_totalFrames}
        step={0.001}
      />
    </div>
  );
};
