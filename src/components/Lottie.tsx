import React, { forwardRef, ForwardRefRenderFunction } from "react";
import useLottie from "../hooks/useLottie";
import useLottiePlayer from "../hooks/useLottiePlayer";
import { LottiePlayerState, LottieProps } from "../types";
import ProgressBar from "./Progress/ProgressBar";

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
  const {
    source,
    loop,
    autoplay,

    onPlayerEvent,
    onPlayerStateChange,
    containerProps,
  } = props;

  // Lottie
  const lottieObject = useLottie({
    source,
    loop,
    autoplay,
  });

  const { setContainerRef, animationItem } = lottieObject;

  // Lottie Player
  const { playerState, currentFrame, play, pause, stop, setSeeker, setSpeed } = useLottiePlayer({
    animationItem,
    onPlayerEvent,
    onPlayerStateChange,
  });

  const isLoading = playerState === LottiePlayerState.Loading;
  const isError = playerState === LottiePlayerState.Error;

  return (
    <div
      style={{
        ...containerProps?.style,
        height: "100%",
      }}
    >
      {isLoading && (
        <img alt="Animation is loading" src="https://svgshare.com/i/Sfy.svg" title="" />
      )}
      {isError && <img alt="Animation error" src="https://svgshare.com/i/Sgd.svg" title="" />}

      <div
        {...containerProps}
        style={{
          height: "100%",
          ...containerProps?.style,
          ...(isLoading || isError ? { display: "none" } : null),
        }}
        ref={setContainerRef}
      />

      {/*TODO: move to the player's UI*/}
      <div style={{ height: 30 }}>
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
        {(playerState === LottiePlayerState.Playing ||
          playerState === LottiePlayerState.Paused ||
          playerState === LottiePlayerState.Stopped) && (
          <button type="button">Loop is {loop ? "on" : "off"}</button>
        )}

        <button
          type="button"
          onClick={() => {
            setSeeker(0, false);
          }}
        >
          Drag to 0
        </button>

        <button
          type="button"
          onClick={() => {
            setSeeker(31, false);
          }}
        >
          Drag to 31
        </button>

        <button
          type="button"
          onClick={() => {
            setSeeker(32, false);
          }}
        >
          Drag to 32
        </button>
        <button
          type="button"
          onClick={() => {
            setSeeker(10, false);
          }}
        >
          Drag to 10
        </button>
        <button
          type="button"
          onClick={() => {
            setSeeker(20, true);
          }}
        >
          Set to 20
        </button>
        <button
          type="button"
          onClick={() => {
            setSeeker("50%", false);
          }}
        >
          Set to 50%
        </button>
        <button
          type="button"
          onClick={() => {
            setSeeker("50%", false);
          }}
        >
          {currentFrame.toFixed(0)}
        </button>
        <button
          type="button"
          onClick={() => {
            setSeeker("50%", false);
          }}
        >
          {animationItem?.totalFrames}
        </button>

        <ProgressBar
          // TODO: add first frame
          currentFrames={currentFrame}
          totalFrames={animationItem?.totalFrames || 1} // TODO: is there another way to cover the last frame?
          onChange={(progress, isDraggingEnded) => {
            setSeeker(progress, !!isDraggingEnded);
          }}
        />
      </div>
    </div>
  );
};

export default forwardRef(Lottie);
