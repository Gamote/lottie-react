import { AnimationDirection, AnimationSegment } from "lottie-web";
import { AnimationItemRef, LottieInteractionMethods } from "../types";

const useInteractionMethods = (
  animationItemRef: AnimationItemRef,
): LottieInteractionMethods => {
  /**
   * Play
   */
  const play = (): void => {
    animationItemRef.current?.play();
  };

  /**
   * Stop
   */
  const stop = (): void => {
    animationItemRef.current?.stop();
  };

  /**
   * Pause
   */
  const pause = (): void => {
    animationItemRef.current?.pause();
  };

  /**
   * Set animation speed
   * @param speed
   */
  const setSpeed = (speed: number): void => {
    animationItemRef.current?.setSpeed(speed);
  };

  /**
   * Got to frame and play
   * @param value
   * @param isFrame
   */
  const goToAndPlay = (value: number, isFrame?: boolean): void => {
    animationItemRef.current?.goToAndPlay(value, isFrame);
  };

  /**
   * Got to frame and stop
   * @param value
   * @param isFrame
   */
  const goToAndStop = (value: number, isFrame?: boolean): void => {
    animationItemRef.current?.goToAndStop(value, isFrame);
  };

  /**
   * Set animation direction
   * @param direction
   */
  const setDirection = (direction: AnimationDirection): void => {
    animationItemRef.current?.setDirection(direction);
  };

  /**
   * Play animation segments
   * @param segments
   * @param forceFlag
   */
  const playSegments = (
    segments: AnimationSegment | AnimationSegment[],
    forceFlag?: boolean,
  ): void => {
    animationItemRef.current?.playSegments(segments, forceFlag);
  };

  /**
   * Set sub frames
   * @param useSubFrames
   */
  const setSubframe = (useSubFrames: boolean): void => {
    animationItemRef.current?.setSubframe(useSubFrames);
  };

  /**
   * Get animation duration
   * @param inFrames
   */
  const getDuration = (inFrames?: boolean): number | undefined => {
    return animationItemRef.current?.getDuration(inFrames);
  };

  /**
   * Destroy animation
   */
  const destroy = (): void => {
    animationItemRef.current?.destroy();
  };

  return {
    play,
    stop,
    pause,
    setSpeed,
    goToAndStop,
    goToAndPlay,
    setDirection,
    playSegments,
    setSubframe,
    getDuration,
    destroy,
  };
};

export default useInteractionMethods;
