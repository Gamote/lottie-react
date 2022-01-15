import React, { forwardRef, ForwardRefRenderFunction } from "react";
import { useLottie } from "../hooks/useLottie";
import { LottieProps } from "../types";
import { PlayerContainer, PlayerDisplay, PlayerControls } from "./player";

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const _Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
  const { src, initialValues, enableReinitialize, onEvent, onStateChange, controls } = props;

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
    initialValues,
    enableReinitialize,
    onEvent,
    onStateChange,
  });

  return (
    <PlayerContainer>
      <PlayerDisplay ref={setContainerRef} />

      {controls && (
        <PlayerControls
          elements={Array.isArray(controls) ? controls : undefined}
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
    </PlayerContainer>
  );
};

export const Lottie = forwardRef(_Lottie);
