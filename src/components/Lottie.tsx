import React, { forwardRef, ForwardRefRenderFunction } from "react";
import useLottie, { LottieHookOptions } from "../hooks/useLottie";
import Player from "./player";
import { PlayerControlsElement } from "./player/PlayerControls";

/**
 * Properties for the `Lottie` component
 */
export type LottieProps = LottieHookOptions & {
  controls?: boolean | PlayerControlsElement[];
};

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 */
const Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
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
    <Player>
      <Player.Container ref={setContainerRef} />

      {controls && (
        <Player.Controls
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
    </Player>
  );
};

export default forwardRef(Lottie);
