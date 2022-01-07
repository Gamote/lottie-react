import { AnimationDirection, AnimationItem, AnimationSegment } from "lottie-web";
import { LottieInteractionMethods } from "../../types";

const useInteractionMethods = (animationItem: AnimationItem | null): LottieInteractionMethods => {
  /**
   * Play
   */
  const play = (): void => {
    animationItem?.play();
  };

  /**
   * Stop
   */
  const stop = (): void => {
    animationItem?.stop();
  };

  /**
   * Pause
   */
  const pause = (): void => {
    animationItem?.pause();
  };

  /**
   * Set animation speed
   * @param speed
   */
  const setSpeed = (speed: number): void => {
    animationItem?.setSpeed(speed);
  };

  /**
   * Got to frame and play
   * @param value
   * @param isFrame
   */
  const goToAndPlay = (value: number, isFrame?: boolean): void => {
    animationItem?.goToAndPlay(value, isFrame);
  };

  /**
   * Got to frame and stop
   * @param value
   * @param isFrame
   */
  const goToAndStop = (value: number, isFrame?: boolean): void => {
    animationItem?.goToAndStop(value, isFrame);
  };

  /**
   * Set animation direction
   * @param direction
   */
  const setDirection = (direction: AnimationDirection): void => {
    animationItem?.setDirection(direction);
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
    animationItem?.playSegments(segments, forceFlag);
  };

  /**
   * Set sub frames
   * @param useSubFrames
   */
  const setSubframe = (useSubFrames: boolean): void => {
    animationItem?.setSubframe(useSubFrames);
  };

  /**
   * Get animation duration
   * @param inFrames
   */
  const getDuration = (inFrames?: boolean): number | undefined =>
    animationItem?.getDuration(inFrames);

  // (Method) Set seeker
  const setSeeker = (seek: number, shouldPlay = false) => {
    // TODO:
  };

  /**
   * Destroy animation
   */
  const destroy = (): void => {
    animationItem?.destroy();
  };

  return {
    play,
    stop,
    pause,
    setSpeed,
    setSeeker,
    // goToAndStop,
    // goToAndPlay,
    // setDirection,
    // playSegments,
    // setSubframe,
    // getDuration,
    // destroy,
  };
};

export default useInteractionMethods;
