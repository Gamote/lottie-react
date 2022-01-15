import React, { forwardRef, ForwardRefRenderFunction } from "react";
import { useLottie } from "../hooks/useLottie";
import { LottieProps, LottieState } from "../types";
import { PlayerContainer, PlayerDisplay, PlayerControls } from "./player";
import { PlayerError } from "./player/PlayerError";
import { PlayerLoading } from "./player/PlayerLoading/PlayerLoading";

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const _Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
  const { src, initialValues, enableReinitialize, controls, eventListeners } = props;

  const {
    setContainerRef,
    state,
    totalFrames,
    loop,
    play,
    pause,
    toggleLoop,
    seek,
    eventSubscriber,
  } = useLottie({
    src,
    initialValues,
    enableReinitialize,
    eventListeners,
  });

  return (
    <PlayerContainer>
      {state === LottieState.Loading && <PlayerLoading />}

      {state === LottieState.Failure && <PlayerError />}

      <PlayerDisplay ref={setContainerRef} />

      {state !== LottieState.Loading && state !== LottieState.Failure && controls && (
        <PlayerControls
          elements={Array.isArray(controls) ? controls : undefined}
          state={state}
          totalFrames={totalFrames}
          loop={loop}
          play={play}
          pause={pause}
          seek={seek}
          toggleLoop={toggleLoop}
          eventSubscriber={eventSubscriber}
        />
      )}
    </PlayerContainer>
  );
};

export const Lottie = forwardRef(_Lottie);
