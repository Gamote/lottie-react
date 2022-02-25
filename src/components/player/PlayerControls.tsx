import React, { FC, RefObject, useCallback } from "react";
import {
  UseLottieFactoryResult,
  Direction,
  LottieState,
  PlayerControlsElement,
} from "../../@types";
import config from "../../config";
import { useFullscreen } from "../../hooks/useFullscreen";
import Spacer from "../misc/Spacer";
import { PlayerControlsFramesIndicator } from "./PlayerControlsFramesIndicator";
import { PlayerControlsProgressBar } from "./PlayerControlsProgressBar/PlayerControlsProgressBar";
import { DirectionButton } from "./buttons/DirectionButton";
import { FullscreenButton } from "./buttons/FullscreenButton";
import { LoopButton } from "./buttons/LoopButton";
import { PauseButton } from "./buttons/PauseButton";
import { PlayButton } from "./buttons/PlayButton";
import { SpeedButton } from "./buttons/SpeedButton";
import { StopButton } from "./buttons/StopButton";

export type PlayerControlsProps = Pick<
  UseLottieFactoryResult,
  | "state"
  | "totalFrames"
  | "direction"
  | "loop"
  | "play"
  | "pause"
  | "stop"
  | "seek"
  | "changeDirection"
  | "toggleLoop"
  | "speed"
  | "changeSpeed"
  | "subscribe"
> & {
  show: boolean;
  fullscreenElementRef?: RefObject<Element>;
  elements?: PlayerControlsElement[];
};

export const PlayerControls: FC<PlayerControlsProps> = (props) => {
  const {
    fullscreenElementRef,
    show,
    elements,
    state,
    totalFrames,
    direction,
    loop,
    play,
    pause,
    stop,
    seek,
    toggleLoop,
    speed,
    changeSpeed,
    changeDirection,
    subscribe,
  } = props;

  // Initialise the hook for using the Fullscreen API
  const { isFullscreen, toggleFullscreen } = useFullscreen(fullscreenElementRef);

  /**
   * Checks if the consumer have any preference on what elements we should display
   */
  const shouldShowElement = useCallback(
    (element: PlayerControlsElement) => {
      // If specific elements weren't specified, display all
      if (!elements || !Array.isArray(elements)) {
        return true;
      }

      // Otherwise, display if `element` is in `elements` array
      return elements.includes(element);
    },
    [elements],
  );

  if (!show) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: config.darkTransparentBackgroundColor,
      }}
    >
      {shouldShowElement(PlayerControlsElement.Play) && state !== LottieState.Playing && (
        <>
          <PlayButton onClick={play} />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.Pause) && state === LottieState.Playing && (
        <>
          <PauseButton onClick={pause} />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.Stop) && state !== LottieState.Stopped && (
        <>
          <StopButton onClick={stop} />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.FramesIndicator) && (
        <>
          <PlayerControlsFramesIndicator
            subscribe={subscribe}
            totalFrames={totalFrames || 0}
            decimals={0}
          />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.ProgressBar) && (
        <>
          <PlayerControlsProgressBar
            subscribe={subscribe}
            totalFrames={totalFrames}
            onChange={(progress, isDraggingEnded) => {
              seek(progress, !!isDraggingEnded);
            }}
          />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.Loop) && (
        <>
          <LoopButton isOn={loop} onClick={toggleLoop} />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.Direction) && (
        <>
          <DirectionButton
            direction={direction}
            onClick={() =>
              changeDirection(direction === Direction.Right ? Direction.Left : Direction.Right)
            }
          />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.PlaybackSpeed) && (
        <>
          <SpeedButton
            speed={speed}
            speeds={[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]}
            onClick={changeSpeed}
          />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.Fullscreen) && (
        <FullscreenButton isFullscreen={isFullscreen} onClick={() => toggleFullscreen?.()} />
      )}
    </div>
  );
};
