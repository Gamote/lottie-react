import { AnimationItem } from "lottie-web";
import React, { FC } from "react";
import { LottiePlayerHookResult, LottiePlayerState } from "../../types";
import Spacer from "../Spacer";
import LoopButton from "./Buttons/LoopButton";
import PauseButton from "./Buttons/PauseButton";
import PlayButton from "./Buttons/PlayButton";
import PlayerFrameIndicator from "./PlayerFrameIndicator";
import ProgressBar from "./ProgressBar";

type PlayerProps = {
  animationItem: AnimationItem | null;
  lottiePlayer: LottiePlayerHookResult;
};

/**
 * This component adds Player capabilities to the Lottie animation
 * TODO: add view for loading and error
 */
const Player: FC<PlayerProps> = ({ children, animationItem, lottiePlayer }) => {
  const { playerState, currentFrame, play, pause, setSeeker } = lottiePlayer;

  const animationView = (
    <div
      style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );

  const controls = (
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
      {playerState !== LottiePlayerState.Playing && (
        <>
          <PlayButton onClick={play} />
          <Spacer size={10} />
        </>
      )}

      {playerState === LottiePlayerState.Playing && (
        <>
          <PauseButton onClick={pause} />
          <Spacer size={10} />
        </>
      )}
      <PlayerFrameIndicator
        currentFrame={currentFrame}
        totalFrames={animationItem?.totalFrames || 0}
      />

      <Spacer size={10} />

      <ProgressBar
        currentFrame={currentFrame}
        // currentFrame={15}
        totalFrames={animationItem?.totalFrames}
        onChange={(progress, isDraggingEnded) => {
          setSeeker(progress, !!isDraggingEnded);
        }}
      />

      <Spacer size={10} />

      <LoopButton isOn={true} />
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {animationView}

      {controls}
    </div>
  );
};

export default Player;
