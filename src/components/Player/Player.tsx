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
    <>
      <div
        style={{
          display: "flex",
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        {(playerState === LottiePlayerState.Paused ||
          playerState === LottiePlayerState.Stopped) && (
          <button type="button" onClick={() => play()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M2 24v-24l20 12-20 12z" />
            </svg>
          </button>
        )}
        {playerState === LottiePlayerState.Playing && (
          <button type="button" onClick={() => pause()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z" />
            </svg>
          </button>
        )}

        <ProgressBar
          currentFrame={currentFrame}
          totalFrames={animationItem?.totalFrames}
          onChange={(progress, isDraggingEnded) => {
            setSeeker(progress, !!isDraggingEnded);
          }}
        />

        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z" />
          </svg>
        </button>
        <button>Speed</button>
        <button>Fullscreen</button>
      </div>
    </>
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
