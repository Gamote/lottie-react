import React, { forwardRef, ForwardRefRenderFunction } from "react";
import useLottieInteractivity from "../hooks/old/useLottieInteractivity";
import useLottie from "../hooks/useLottie";
import useLottiePlayer, { LottiePlayerState } from "../hooks/useLottiePlayer";
import { LottieProps } from "../types";

/**
 * Lottie animation
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

    lottieRef,
    interactivity,
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
  const { playerState } = useLottiePlayer(animationItem, {
    onPlayerEvent,
    onPlayerStateChange,
  });

  const isLoading = playerState === LottiePlayerState.Loading;
  const isError = playerState === LottiePlayerState.Error;

  // TODO: ref
  // /**
  //  * Make the player object available through the provided 'ref'
  //  */
  // if (ref) {
  //   if (typeof ref === "function") {
  //     ref(lottieObject);
  //   } else {
  //     ref.current = lottieObject;
  //   }
  // }

  // TODO: lottieRef
  // /**
  //  * Make the lottie object available through the provided 'lottieRef'
  //  */
  // if (lottieRef) {
  //   lottieRef.current = lottieObject.animationItem;
  // }

  // TODO: interactivity
  // /**
  //  * Interactive view
  //  */
  // const interactivityL = useLottieInteractivity({
  //   lottieObject,
  //   mode: "scroll",
  //   actions: [
  //     {
  //       visibility: [0, 0.2],
  //       type: "stop",
  //       frames: [0],
  //     },
  //     {
  //       visibility: [0.2, 0.45],
  //       type: "seek",
  //       frames: [0, 45],
  //     },
  //     {
  //       visibility: [0.45, 1.0],
  //       type: "loop",
  //       frames: [45, 60],
  //     },
  //   ],
  //   ...interactivity,
  // });
  //
  // if (interactivity) {
  //   return interactivityL;
  // }

  return (
    <div
      style={{
        ...containerProps,
        height: "100%",
      }}
    >
      {isLoading && (
        <img alt="Animation is loading" src="https://svgshare.com/i/Sfy.svg" title="" />
      )}
      {isError && <img alt="Animation error" src="https://svgshare.com/i/Sgd.svg" title="" />}

      <div
        style={{
          height: "100%",
          ...containerProps?.style,
          ...(isLoading || isError ? { display: "none" } : null),
        }}
        ref={setContainerRef}
      />

      {/*TODO: move to player*/}
      {/*<div>*/}
      {/*  {(playerState === PlayerState.Paused || playerState === PlayerState.Stopped) && (*/}
      {/*    <button type="button" onClick={() => play()}>*/}
      {/*      Play*/}
      {/*    </button>*/}
      {/*  )}*/}
      {/*  {playerState === PlayerState.Playing && (*/}
      {/*    <button type="button" onClick={() => pause()}>*/}
      {/*      Pause*/}
      {/*    </button>*/}
      {/*  )}*/}
      {/*  {(playerState === PlayerState.Playing || playerState === PlayerState.Paused) && (*/}
      {/*    <button type="button" onClick={() => stop()}>*/}
      {/*      Stop*/}
      {/*    </button>*/}
      {/*  )}*/}
      {/*  {(playerState === PlayerState.Playing || playerState === PlayerState.Paused) && (*/}
      {/*    <button type="button" onClick={() => stop()}>*/}
      {/*      Loop is {config.loop ? "on" : "off"}*/}
      {/*    </button>*/}
      {/*  )}*/}
      {/*  <ProgressBar*/}
      {/*    // TODO: add first frame*/}
      {/*    currentFrames={currentFrame}*/}
      {/*    totalFrames={(animationItem?.totalFrames || 1) - 1} // TODO: is there another way to cover the last frame?*/}
      {/*    onChange={(progress, isDraggingEnded) => {*/}
      {/*      setSeeker(progress, isDraggingEnded && playerState === PlayerState.Playing);*/}
      {/*      // If the consumer is not done dragging the progress indicator*/}
      {/*      // set it back to what it was, because `setSeeker()` changed it*/}
      {/*      // TODO: should we move the logic in `setSeeker()` and pass `isDraggingEnded`*/}
      {/*      //  or create an `ON_HOLD` state and keep the previous state?*/}
      {/*      if (!isDraggingEnded) {*/}
      {/*        setPlayerState(playerState, true);*/}
      {/*      }*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  );
};

export default forwardRef(Lottie);
