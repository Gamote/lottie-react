import React, {
  CSSProperties,
  useEffect,
  useRef,
  ReactElement,
  useState,
} from "react";
import lottie, {
  AnimationConfigWithData,
  AnimationItem,
  AnimationDirection,
  AnimationSegment,
} from "lottie-web";
import {
  Listener,
  LottieComponentProps,
  LottieRefCurrentProps,
  PartialListener,
} from "../types";

const useLottie = (
  props: LottieComponentProps,
  style?: CSSProperties,
): { View: ReactElement } & LottieRefCurrentProps => {
  const {
    animationData,
    loop,
    autoplay,
    initialSegment,
    onComplete,
    onLoopComplete,
    onEnterFrame,
    onSegmentStart,
    onConfigReady,
    onDataReady,
    onDataFailed,
    onLoadedImages,
    onDOMLoaded,
    onDestroy,
    ...rest
  } = props;

  const [animationLoaded, setAnimationLoaded] = useState(false);
  const animationInstanceRef = useRef<AnimationItem>();
  const animationContainer = useRef<HTMLDivElement>(null);

  /*
		======================================
			INTERACTION METHODS
		======================================
	 */

  /**
   * Play
   */
  const play = (): void => {
    animationInstanceRef.current?.play();
  };

  /**
   * Stop
   */
  const stop = (): void => {
    animationInstanceRef.current?.stop();
  };

  /**
   * Pause
   */
  const pause = (): void => {
    animationInstanceRef.current?.pause();
  };

  /**
   * Set animation speed
   * @param speed
   */
  const setSpeed = (speed: number): void => {
    animationInstanceRef.current?.setSpeed(speed);
  };

  /**
   * Got to frame and play
   * @param value
   * @param isFrame
   */
  const goToAndPlay = (value: number, isFrame?: boolean): void => {
    animationInstanceRef.current?.goToAndPlay(value, isFrame);
  };

  /**
   * Got to frame and stop
   * @param value
   * @param isFrame
   */
  const goToAndStop = (value: number, isFrame?: boolean): void => {
    animationInstanceRef.current?.goToAndStop(value, isFrame);
  };

  /**
   * Set animation direction
   * @param direction
   */
  const setDirection = (direction: AnimationDirection): void => {
    animationInstanceRef.current?.setDirection(direction);
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
    animationInstanceRef.current?.playSegments(segments, forceFlag);
  };

  /**
   * Set sub frames
   * @param useSubFrames
   */
  const setSubframe = (useSubFrames: boolean): void => {
    animationInstanceRef.current?.setSubframe(useSubFrames);
  };

  /**
   * Get animation duration
   * @param inFrames
   */
  const getDuration = (inFrames?: boolean): number | undefined => {
    return animationInstanceRef.current?.getDuration(inFrames);
  };

  /**
   * Destroy animation
   */
  const destroy = (): void => {
    animationInstanceRef.current?.destroy();
  };

  /*
		======================================
			LOTTIE
		======================================
	 */

  /**
   * Load a new animation, and if it's the case, destroy the previous one
   * @param {Object} forcedConfigs
   */
  const loadAnimation = (forcedConfigs = {}) => {
    // Return if the container ref is null
    if (!animationContainer.current) {
      return;
    }

    // Destroy any previous instance
    animationInstanceRef.current?.destroy();

    // Build the animation configuration
    const config: AnimationConfigWithData = {
      ...props,
      ...forcedConfigs,
      container: animationContainer.current,
    };

    // Save the animation instance
    animationInstanceRef.current = lottie.loadAnimation(config);

    setAnimationLoaded(!!animationInstanceRef.current);
  };

  /**
   * Initialize and listen for changes that need to reinitialize Lottie
   */
  useEffect(() => {
    loadAnimation();
  }, [animationData, loop, autoplay, initialSegment]);

  /*
		======================================
			EVENTS
		======================================
	 */

  /**
   * Reinitialize listener on change
   */
  useEffect(() => {
    const partialListeners: PartialListener[] = [
      { name: "complete", handler: onComplete },
      { name: "loopComplete", handler: onLoopComplete },
      { name: "enterFrame", handler: onEnterFrame },
      { name: "segmentStart", handler: onSegmentStart },
      { name: "config_ready", handler: onConfigReady },
      { name: "data_ready", handler: onDataReady },
      { name: "data_failed", handler: onDataFailed },
      { name: "loaded_images", handler: onLoadedImages },
      { name: "DOMLoaded", handler: onDOMLoaded },
      { name: "destroy", handler: onDestroy },
    ];

    const listeners = partialListeners.filter(
      (listener: PartialListener): listener is Listener =>
        listener.handler != null,
    );

    if (!listeners.length) {
      return;
    }

    const deregisterList = listeners.map(
      /**
       * Handle the process of adding an event listener
       * @param {Listener} listener
       * @return {Function} Function that deregister the listener
       */
      (listener) => {
        animationInstanceRef.current?.addEventListener(
          listener.name,
          listener.handler,
        );

        // Return a function to deregister this listener
        return () => {
          animationInstanceRef.current?.removeEventListener(
            listener.name,
            listener.handler,
          );
        };
      },
    );

    // Deregister listeners on unmount
    return () => {
      deregisterList.forEach((deregister) => deregister());
    };
  }, [
    onComplete,
    onLoopComplete,
    onEnterFrame,
    onSegmentStart,
    onConfigReady,
    onDataReady,
    onDataFailed,
    onLoadedImages,
    onDOMLoaded,
    onDestroy,
  ]);

  /**
   * Build the animation view
   */
  const View = <div style={style} ref={animationContainer} {...rest} />;

  return {
    View,
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
    animationLoaded,
    animationItem: animationInstanceRef.current,
  };
};

export default useLottie;
