import React, { forwardRef, ForwardRefRenderFunction } from "react";
import useLottie from "../hooks/useLottie";
import { LottieProps, LottieState } from "../types";
import LoopButton from "./Player/Buttons/LoopButton";
import PauseButton from "./Player/Buttons/PauseButton";
import PlayButton from "./Player/Buttons/PlayButton";
import PlayerFrameIndicator from "./Player/PlayerFrameIndicator";
import ProgressBar from "./Player/ProgressBar";
import Spacer from "./Spacer";

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
  const { source, loop, autoplay, onEvent, onStateChange } = props;

  const {
    setContainerRef,
    animationItem,
    state,
    currentFrame,
    play,
    pause,
    toggleLoop,
    setSeeker,
  } = useLottie({
    source,
    loop,
    autoplay,
    onEvent,
    onStateChange,
  });

  const animation = (
    <div
      style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
        ref={setContainerRef}
      />
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

      <PlayerFrameIndicator
        currentFrame={currentFrame}
        totalFrames={animationItem?.totalFrames || 0}
      />

      <Spacer size={10} />

      <ProgressBar
        currentFrame={currentFrame}
        totalFrames={animationItem?.totalFrames}
        onChange={(progress, isDraggingEnded) => {
          setSeeker(progress, !!isDraggingEnded);
        }}
      />

      <Spacer size={10} />

      <LoopButton isOn={animationItem?.loop} onClick={toggleLoop} />
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
      {animation}
      {controls}
    </div>
  );
};

export default forwardRef(Lottie);
