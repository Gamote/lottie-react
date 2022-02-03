import { LottiePlayer } from "lottie-web";
import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle } from "react";
import { LottieProps, LottieRef, LottieState, LottieVersion } from "../@types";
import { useLottieFactory } from "../hooks/useLottieFactory";
import {
  PlayerFailure,
  PlayerLoading,
  PlayerContainer,
  PlayerControls,
  PlayerDisplay,
} from "./player";

/**
 * High Order Component to build Lottie's animation component
 * with different versions of the animations
 *
 * @param lottie
 */
export const lottieHoc = <Version extends LottieVersion>(lottie: LottiePlayer) => {
  const Lottie: ForwardRefRenderFunction<LottieRef, LottieProps<Version>> = (props, ref) => {
    const {
      controls,
      LoadingOverlay,
      LoadingOverlayContent,
      loadingMinDisplayTime,
      loadingFadeOutTime,
      disableLoading,
      FailureOverlay,
      FailureOverlayContent,
      disableFailure,
      ...hookOptions
    } = props;

    const { setContainerRef, ...lottieFactoryResult } = useLottieFactory<Version>(lottie, {
      ...hookOptions,
    });

    /**
     * Make the hook variables/methods available through the provided 'lottieRef'
     */
    useImperativeHandle(ref, () => lottieFactoryResult);

    const {
      state,
      totalFrames,
      direction,
      loop,
      play,
      pause,
      stop,
      toggleLoop,
      speed,
      changeSpeed,
      changeDirection,
      seek,
      subscribe,
    } = lottieFactoryResult;

    return (
      <PlayerContainer>
        <PlayerLoading
          show={!disableLoading && state === LottieState.Loading}
          minDisplayTime={loadingMinDisplayTime}
          fadeOutTime={loadingFadeOutTime}
          Component={LoadingOverlay}
          Content={LoadingOverlayContent}
        />

        <PlayerFailure
          show={!disableFailure && state === LottieState.Failure}
          Component={FailureOverlay}
          Content={FailureOverlayContent}
        />

        <PlayerDisplay ref={setContainerRef} />

        <PlayerControls
          show={state !== LottieState.Loading && state !== LottieState.Failure && !!controls}
          elements={Array.isArray(controls) ? controls : undefined}
          state={state}
          totalFrames={totalFrames}
          direction={direction}
          loop={loop}
          play={play}
          pause={pause}
          stop={stop}
          seek={seek}
          toggleLoop={toggleLoop}
          speed={speed}
          changeSpeed={changeSpeed}
          changeDirection={changeDirection}
          subscribe={subscribe}
        />
      </PlayerContainer>
    );
  };

  return forwardRef(Lottie);
};
