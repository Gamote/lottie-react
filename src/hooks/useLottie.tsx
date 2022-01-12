import lottie, { AnimationSegment, AnimationItem } from "lottie-web";
import { useCallback, useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import {
  LottieEvent,
  LottieHookOptions,
  LottieHookResult,
  LottieEventListener,
  LottieState,
} from "../types";
import getNumberFromNumberOrPercentage from "../utils/getNumberFromNumberOrPercentage";
import isFunction from "../utils/isFunction";
import logger from "../utils/logger";
import normalizeAnimationSource from "../utils/normalizeAnimationSource";
import useCallbackRef from "./useCallbackRef";
import useLottieState from "./useLottieState";

/**
 * Lottie's animation hook
 * @param options
 */
const useLottie = ({
  src,
  enableReinitialize = false,
  onStateChange,
  onEvent,
  ...rest
}: LottieHookOptions): LottieHookResult => {
  const options = {
    enableReinitialize,
    ...rest,
  };

  // (Ref) Animation's container
  // By using a callback ref, a rerender will be trigger when its value changed
  // this way the consumer have the option to set the container, and we know
  // when, and if, the animation should be (re)loaded
  const { ref: containerRef, setRef: setContainerRef } = useCallbackRef<HTMLDivElement>();

  // (State) Animation instance
  const [animationItem, setAnimationItem] = useState<AnimationItem | null>(null);

  // (State) Animation's state
  const { previousState, state, setState } = useLottieState({
    initialState: LottieState.Loading,
    onChange: (previousPlayerState, newPlayerState) => {
      if (onStateChange && isFunction(onStateChange)) {
        onStateChange(newPlayerState);
      }
    },
  });

  // (Ref) Initial values provided by the consumer
  const _initialValues = useRef(options.initialValues);

  // (State) Initial states converted to local states
  const [loop, setLoop] = useState<boolean | number>(options.initialValues?.loop || false);
  const [autoplay, setAutoplay] = useState<boolean>(options.initialValues?.autoplay || false);
  const [initialSegment, setInitialSegment] = useState<AnimationSegment | undefined>(
    options.initialValues?.segment || undefined,
  );

  // (State) Animation's state before seeking
  // By keeping this we can pause the animation while the seeking action is
  // happening and return to it immediately, offering a smooth experience
  const [stateBeforeSeeking, setStateBeforeSeeking] = useState<LottieState | null>(null);

  // (State) Animation's current frame
  const [currentFrame, setCurrentFrame] = useState<number>(0);

  /**
   * Trigger an event
   * @param eventName
   */
  const triggerEvent = useCallback(
    (eventName: LottieEvent) => {
      if (onEvent) {
        onEvent(eventName);
      }
    },
    [onEvent],
  );

  /**
   * (Re)initialize the animation when the container and/or source change
   */
  useEffect(
    () => {
      logger.log("🪄 Trying to (re)initialize the animation");

      // Set the state to loading until the animation is (re)initialized
      // TODO: reset hook (e.g. reset()) where we can for example:
      //  - set the currentFrame to 0
      //  - set the state to loading etc
      setState((prevState) =>
        prevState === LottieState.Loading ? prevState : LottieState.Loading,
      );

      // Checks that the container is ready
      if (!containerRef?.current) {
        logger.log("⌛️ The container is not ready yet");
        return;
      }

      // Destroy any previous animation
      if (animationItem) {
        logger.log("🗑 Animation already initialized, destroying it");
        animationItem.destroy();
      }

      // Checks if the animation's source have the right format
      const normalizedAnimationSource = normalizeAnimationSource(src);

      if (!normalizedAnimationSource) {
        logger.log("😥 Animation source is not valid");
        triggerEvent(LottieEvent.Error);
        setState((prevState) => (prevState === LottieState.Error ? prevState : LottieState.Error));
        return;
      }

      // Initialize animation
      let _animationItem: AnimationItem;

      try {
        _animationItem = lottie.loadAnimation({
          ...normalizedAnimationSource,
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          initialSegment,
          assetsPath: _initialValues.current?.assetsPath,
          rendererSettings: _initialValues.current?.rendererSettings,
        });
      } catch (e) {
        logger.warn("⚠️ Error while trying to load animation", e);
        triggerEvent(LottieEvent.Error);
        setState((prevState) => (prevState === LottieState.Error ? prevState : LottieState.Error));
        return;
      }

      // Save Lottie's animation item
      logger.log("👌 Animation was initialized", _animationItem);
      setAnimationItem(_animationItem);

      // Definitions the behaviour how to handle animation effects
      const listeners: LottieEventListener[] = [
        {
          name: "complete",
          handler: () => {
            setState(LottieState.Stopped);
            triggerEvent(LottieEvent.Complete);
          },
        },
        {
          name: "loopComplete",
          handler: () => {
            triggerEvent(LottieEvent.LoopCompleted);
          },
        },
        {
          name: "enterFrame",
          handler: () => {
            // ! IMPORTANT
            // TODO: check if we can handle this event in the player controls
            //  take in the account the consumer that might want to use it when
            //  the hook is used outside of the predefined UI
            triggerEvent(LottieEvent.Frame);
            if (_animationItem && _animationItem.currentFrame !== currentFrame) {
              setCurrentFrame(_animationItem.currentFrame);
            }
          },
        },
        { name: "segmentStart", handler: () => undefined },
        { name: "config_ready", handler: () => undefined },
        {
          name: "data_ready",
          handler: () => {
            triggerEvent(LottieEvent.Ready);
          },
        },
        {
          name: "data_failed",
          handler: () => {
            setState(LottieState.Error);
          },
        },
        { name: "loaded_images", handler: () => undefined },
        {
          name: "DOMLoaded",
          handler: () => {
            triggerEvent(LottieEvent.Load);
            setState(_animationItem?.autoplay ? LottieState.Playing : LottieState.Stopped);
          },
        },
        { name: "destroy", handler: () => undefined },
      ];

      // Attach event listeners and return functions to deregister them
      const listenerDeregisterList = listeners.map((listener) => {
        try {
          _animationItem?.addEventListener(listener.name, listener.handler);
        } catch (e) {
          // * There might be cases in which the `animationItem` exists but
          // * it's not ready yet, and in that case `addEventListener` will
          // * throw an error. That's why we skip these errors.
        }

        // Return a function to deregister this listener
        return () => {
          try {
            _animationItem?.removeEventListener(listener.name, listener.handler);
          } catch (e) {
            // * There might be cases in which the `animationItem` exists but
            // * it was destroyed, and in that case `removeEventListener` will
            // * throw an error. That's why we skip these errors.
          }
        };
      });

      logger.log("👂 Event listeners were registered");

      // Cleanup sequence on unmount
      return () => {
        logger.log("🧹 Animation is unloading, cleaning up...");
        listenerDeregisterList.forEach((deregister) => deregister());
        _animationItem.destroy();
        setAnimationItem(null);
      };
    },
    // * We are disabling the `exhaustive-deps` here because we want to
    // * (re)initialise only when the container ref and/or the source change
    // ! DON'T CHANGE because we will end up having the "Maximum update depth exceeded" error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef.current, src],
  );

  /**
   * Process initial values changes and update any dependent state
   */
  useEffect(() => {
    // Skip update if there is no animation item, reinitialization is not enabled
    // or the initial values are equal with the previous ones
    if (
      !animationItem ||
      !enableReinitialize ||
      isEqual(_initialValues.current, options.initialValues)
    ) {
      return;
    }

    // Save the new values
    _initialValues.current = options.initialValues;

    // Loop
    setLoop((prevState) => {
      // Skip update if equal
      if (_initialValues.current?.loop === prevState) {
        return prevState;
      }

      const newState = _initialValues.current?.loop ?? false;
      // TODO: check why is accepting just boolean when the config allow numbers as well
      animationItem.loop = !!newState;
      return newState;
    });

    // Autoplay
    setAutoplay((prevState) => {
      // Skip update if equal
      if (_initialValues.current?.autoplay === prevState) {
        return prevState;
      }

      const newState = _initialValues.current?.autoplay ?? false;
      animationItem.autoplay = newState;
      return newState;
    });

    // TODO: handle initialSegment change
    // Initial segment
    // useEffect(() => {
    //   if (!animationItem) {
    //     return;
    //   }
    //
    //   // When null should reset to default animation length
    //   if (!initialSegment) {
    //     animationItem.resetSegments(false);
    //     // TODO: find a way to increase the totalFrames to the max in the current loop
    //     return;
    //   }
    //
    //   // If it's not a valid segment, do nothing
    //   if (!Array.isArray(initialSegment) || !initialSegment.length) {
    //     return;
    //   }
    //
    //   // If the current frame it's not in the new initial segment
    //   // set the current frame to the first position of the initial segment
    //   if (
    //     animationItem.currentRawFrame < initialSegment[0] ||
    //     animationItem.currentRawFrame > initialSegment[1]
    //   ) {
    //     animationItem.currentRawFrame = initialSegment[0];
    //   }
    //
    //   // Update the segment
    //   animationItem.setSegment(initialSegment[0], initialSegment[1]);
    // }, [animationItem, initialSegment]);

    // TODO: handle assetsPath change

    // TODO: handle rendererSettings change
  }, [animationItem, enableReinitialize, options.initialValues]);

  /**
   * Interaction methods
   */
  // Play
  const play = useCallback(() => {
    if (animationItem) {
      animationItem.play();
      setState(LottieState.Playing);
      triggerEvent(LottieEvent.Play);
    }
  }, [animationItem, setState, triggerEvent]);

  // Pause
  const pause = useCallback(() => {
    if (animationItem) {
      animationItem.pause();
      setState(LottieState.Paused);
      triggerEvent(LottieEvent.Pause);
    }
  }, [animationItem, setState, triggerEvent]);

  // Stop
  const stop = useCallback(() => {
    if (animationItem) {
      animationItem.goToAndStop(1);
      setState(LottieState.Stopped);
      triggerEvent(LottieEvent.Stop);
    }
  }, [animationItem, setState, triggerEvent]);

  // Toggle looping
  const toggleLoop = useCallback(() => {
    if (animationItem) {
      animationItem.loop = !animationItem.loop;
      setLoop(animationItem.loop);
    }
  }, [animationItem]);

  // Set player speed
  const setSpeed = useCallback(
    (speed: number) => {
      if (animationItem) {
        animationItem?.setSpeed(speed);
      }
    },
    [animationItem],
  );

  /**
   * Change the current frame from the animation
   * @param value
   * @param isSeekingEnded
   */
  const seek = useCallback(
    (value: number | string, isSeekingEnded: boolean) => {
      if (!animationItem) {
        return;
      }

      const seekInfo = getNumberFromNumberOrPercentage(value);

      if (!seekInfo) {
        return;
      }

      const frame = seekInfo.isPercentage
        ? (animationItem.totalFrames * seekInfo.number) / 100
        : seekInfo.number;

      setState((prevState) => {
        // Remember the state before seeking, so we can set it back when the seeking is done
        if (!isSeekingEnded && !stateBeforeSeeking) {
          setStateBeforeSeeking(prevState);
        } else if (isSeekingEnded && stateBeforeSeeking) {
          setStateBeforeSeeking(null);
        }

        const shouldPlayAfter =
          isSeekingEnded &&
          (prevState === LottieState.Playing || stateBeforeSeeking === LottieState.Playing);

        if (shouldPlayAfter) {
          animationItem?.goToAndPlay(frame, true);
          return LottieState.Playing;
        } else {
          animationItem?.goToAndStop(frame, true);

          if (prevState !== LottieState.Stopped) {
            return LottieState.Paused;
          }
        }

        // Skip update
        return prevState;
      });
    },
    [animationItem, setState, stateBeforeSeeking],
  );

  return {
    setContainerRef,
    animationItem,
    state,
    currentFrame,
    loop,
    play,
    pause,
    stop,
    toggleLoop,
    setSpeed,
    seek,
  };
};

export default useLottie;
