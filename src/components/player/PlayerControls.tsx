import React, { FC } from "react";
import { LottieState } from "../../types";
import LoopButton from "../buttons/LoopButton";
import PauseButton from "../buttons/PauseButton";
import PlayButton from "../buttons/PlayButton";
import Spacer from "../misc/Spacer";
import PlayerControlsProgress from "./PlayerControlsProgress";
import PlayerFrameIndicator from "./PlayerFrameIndicator";

// TODO: adapt type, maybe use reference to the original ones already defined
type PlayerControlsProps = {
  state: LottieState;
  currentFrame: number;
  totalFrames?: number;
  loop?: boolean | number;
  play: () => void;
  pause: () => void;
  seek: (frame: number, isDraggingEnded: boolean) => void; // better naming
  toggleLoop: () => void;
};

const PlayerControls: FC<PlayerControlsProps> = (props) => {
  const { state, currentFrame, totalFrames, loop, play, pause, seek, toggleLoop } = props;

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
      {state !== LottieState.Playing && (
        <>
          <PlayButton onClick={play} />
          <Spacer size={10} />
        </>
      )}

      {state === LottieState.Playing && (
        <>
          <PauseButton onClick={pause} />
          <Spacer size={10} />
        </>
      )}

      <PlayerFrameIndicator currentFrame={currentFrame} totalFrames={totalFrames || 0} />

      <Spacer size={10} />

      <PlayerControlsProgress
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        onChange={(progress, isDraggingEnded) => {
          seek(progress, !!isDraggingEnded);
        }}
      />

      <Spacer size={10} />

      <LoopButton isOn={loop} onClick={toggleLoop} />
    </div>
  );
};

export default PlayerControls;
