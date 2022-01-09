import { AnimationItem } from "lottie-web";
import React, { FC } from "react";
import { LottiePlayerHookResult, LottiePlayerState } from "../../types";
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
  const { playerState, currentFrame, play, pause, stop, setSeeker, setSpeed } = lottiePlayer;

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
    <>
      <div
        style={{
          display: "flex",
        }}
      >
        {(playerState === LottiePlayerState.Paused ||
          playerState === LottiePlayerState.Stopped) && (
          <button type="button" onClick={() => play()}>
            Play
          </button>
        )}
        {playerState === LottiePlayerState.Playing && (
          <button type="button" onClick={() => pause()}>
            Pause
          </button>
        )}

        {(playerState === LottiePlayerState.Playing ||
          playerState === LottiePlayerState.Paused) && (
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        )}

        <ProgressBar
          currentFrame={currentFrame}
          totalFrames={animationItem?.totalFrames}
          onChange={(progress, isDraggingEnded) => {
            setSeeker(progress, !!isDraggingEnded);
          }}
        />

        <button>Loop</button>
        <button>Speed</button>
        <button>Fullscreen</button>
      </div>
    </>
  );

  return (
    <div
      className="lottie-player1"
      style={{ height: 200, display: "flex", flexDirection: "column" }}
    >
      {animationView}

      {controls}
    </div>
  );
};

export default Player;
