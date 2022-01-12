import React, { FC, useCallback } from "react";
import { LottieState, PlayerControlsElement } from "../../types";
import Spacer from "../misc/Spacer";
import PlayerControlsFrameIndicator from "./PlayerControlsFrameIndicator";
import PlayerControlsProgressBar from "./PlayerControlsProgressBar";
import LoopButton from "./buttons/LoopButton";
import PauseButton from "./buttons/PauseButton";
import PlayButton from "./buttons/PlayButton";

// TODO: adapt type, maybe use reference to the original ones already defined
type PlayerControlsProps = {
  elements?: PlayerControlsElement[];
  state: LottieState;
  currentFrame: number;
  totalFrames?: number;
  loop?: boolean | number;
  play: () => void;
  pause: () => void;
  seek: (frame: number, isDraggingEnded: boolean) => void; // TODO: better naming
  toggleLoop: () => void;
};

const PlayerControls: FC<PlayerControlsProps> = (props) => {
  const { elements, state, currentFrame, totalFrames, loop, play, pause, seek, toggleLoop } = props;

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

      {shouldShowElement(PlayerControlsElement.FramesIndicator) && (
        <>
          <PlayerControlsFrameIndicator
            currentFrame={currentFrame}
            totalFrames={totalFrames || 0}
          />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.ProgressBar) && (
        <>
          <PlayerControlsProgressBar
            currentFrame={currentFrame}
            totalFrames={totalFrames}
            onChange={(progress, isDraggingEnded) => {
              seek(progress, !!isDraggingEnded);
            }}
          />
          <Spacer size={10} />
        </>
      )}

      {shouldShowElement(PlayerControlsElement.Loop) && (
        <LoopButton isOn={loop} onClick={toggleLoop} />
      )}
    </div>
  );
};

export default PlayerControls;
