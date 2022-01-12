import React, { forwardRef, ForwardRefRenderFunction } from "react";
import useLottie from "../hooks/useLottie";
import { LottieProps } from "../types";
import Player from "./player";

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
  const { src, loop: initialLoop, autoplay, onEvent, onStateChange, controls } = props;

  const {
    setContainerRef,
    animationItem,
    state,
    loop,
    currentFrame,
    play,
    pause,
    toggleLoop,
    seek,
  } = useLottie({
    src,
    loop: initialLoop,
    autoplay,
    onEvent,
    onStateChange,
  });

  return (
    <Player>
      <Player.Container ref={setContainerRef} />

      {controls && (
        <Player.Controls
          state={state}
          currentFrame={currentFrame}
          totalFrames={animationItem?.totalFrames}
          loop={loop}
          play={play}
          pause={pause}
          seek={seek}
          toggleLoop={toggleLoop}
        />
      )}
    </Player>
  );
};

export default forwardRef(Lottie);
