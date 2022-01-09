import React, { forwardRef, ForwardRefRenderFunction } from "react";
import useLottie from "../hooks/useLottie";
import useLottiePlayer from "../hooks/useLottiePlayer";
import { LottieProps } from "../types";
import Player from "./Player/Player";

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const Lottie: ForwardRefRenderFunction<Record<string, unknown>, LottieProps> = (props, ref) => {
  const { source, loop, autoplay, onPlayerEvent, onPlayerStateChange } = props;

  // Lottie
  const lottieObject = useLottie({
    source,
    loop,
    autoplay,
  });

  const { setContainerRef, animationItem } = lottieObject;

  // Lottie Player
  const lottiePlayer = useLottiePlayer({
    animationItem,
    onPlayerEvent,
    onPlayerStateChange,
  });

  return (
    <Player animationItem={animationItem} lottiePlayer={lottiePlayer}>
      <div ref={setContainerRef} />
    </Player>
  );
};

export default forwardRef(Lottie);
