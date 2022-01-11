import lottie, { AnimationItem } from "lottie-web/build/player/lottie";
import { useCallback, useEffect, useState } from "react";
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
const useLottie = (options: LottieHookOptions): LottieHookResult => {
  const {
    source,
    loop,
    autoplay,
    initialSegment,
    assetsPath,
    rendererSettings,
    debug,
    onStateChange,
    onEvent,
  } = options;

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

      // TODO: should we set the state to "Loading" in case wasn't. Investigate.

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

      // TODO: look into web-workers

      // Checks if the animation's source have the right format
      const normalizedAnimationSource = normalizeAnimationSource(source);

      if (!normalizedAnimationSource) {
        logger.log("😥 Animation source is not valid");
        // triggerEvent(PlayerEvent.Error);
        // setPlayerState(PlayerState.Error);
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
          assetsPath,
          rendererSettings,
        });
      } catch (e) {
        logger.log("⚠️ Error while trying to load animation");
        // TODO: check if we need to propagate this, maybe it will be useful for the player
        //  or not, and the player can say: "No animation loaded..."
        // triggerEvent(PlayerEvent.Error);
        // setPlayerState(PlayerState.Error);
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
          // TODO: check if `lottie-web` offers a way to check if the animation
          //  is able to add events
        }

        // Return a function to deregister this listener
        return () => {
          try {
            _animationItem?.removeEventListener(listener.name, listener.handler);
          } catch (e) {
            // * There might be cases in which the `animationItem` exists but
            // * it was destroyed, and in that case `removeEventListener` will
            // * throw an error. That's why we skip these errors.
            // TODO: check if `lottie-web` offers a way to check if the animation
            //  is able to remove events
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
    [containerRef.current, source],
  );

  /**
   * Animation's effects
   *
   * Each effect is taking care of updating individual settings
   */
  // Loop
  useEffect(() => {
    if (animationItem) {
      animationItem.loop = !!loop;
    }
  }, [animationItem, loop]);

  // Autoplay
  useEffect(() => {
    if (animationItem) {
      animationItem.autoplay = Boolean(autoplay);
    }
  }, [animationItem, autoplay]);

  // Initial segment // TODO: to finish
  useEffect(() => {
    if (!animationItem) {
      return;
    }

    // When null should reset to default animation length
    if (!initialSegment) {
      animationItem.resetSegments(false);
      // TODO: find a way to increase the totalFrames to the max in the current loop
      return;
    }

    // If it's not a valid segment, do nothing
    if (!Array.isArray(initialSegment) || !initialSegment.length) {
      return;
    }

    // If the current frame it's not in the new initial segment
    // set the current frame to the first position of the initial segment
    if (
      animationItem.currentRawFrame < initialSegment[0] ||
      animationItem.currentRawFrame > initialSegment[1]
    ) {
      animationItem.currentRawFrame = initialSegment[0];
    }

    // Update the segment
    animationItem.setSegment(initialSegment[0], initialSegment[1]);
  }, [animationItem, initialSegment]);

  // TODO: handle assetsPath change

  // TODO: handle rendererSettings change

  /**
   * Interaction methods
   */
  // Play
  const play = () => {
    if (animationItem) {
      animationItem.play();
      setState(LottieState.Playing);
      triggerEvent(LottieEvent.Play);
    }
  };

  // Pause
  const pause = () => {
    if (animationItem) {
      animationItem.pause();
      setState(LottieState.Paused);
      triggerEvent(LottieEvent.Pause);
    }
  };

  // Stop
  const stop = () => {
    if (animationItem) {
      animationItem.goToAndStop(1);
      setState(LottieState.Stopped);
      triggerEvent(LottieEvent.Stop);
    }
  };

  // Toggle looping
  // TODO: doesn't update children if the animation is paused, check the other components
  const toggleLoop = () => {
    if (animationItem) {
      animationItem.loop = !animationItem.loop;
    }
  };

  // Set player speed
  const setSpeed = (speed: number) => {
    animationItem?.setSpeed(speed);
  };

  /**
   * Change the current frame from the animation
   * @param value
   * @param isSeekingEnded
   */
  const seek = (value: number | string, isSeekingEnded = false) => {
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

    // Remember the state before seeking, so we can set it back when the seeking is done
    if (!isSeekingEnded && !stateBeforeSeeking) {
      setStateBeforeSeeking(state);
    } else if (isSeekingEnded && stateBeforeSeeking) {
      setStateBeforeSeeking(null);
    }

    const shouldPlayAfter =
      isSeekingEnded &&
      (state === LottieState.Playing || stateBeforeSeeking === LottieState.Playing);

    if (shouldPlayAfter) {
      animationItem?.goToAndPlay(frame, true);
      setState(LottieState.Playing);
    } else {
      animationItem?.goToAndStop(frame, true);

      if (state !== LottieState.Stopped) {
        setState(LottieState.Paused);
      }
    }
  };

  return {
    setContainerRef,
    animationItem,
    state,
    currentFrame,
    play,
    pause,
    stop,
    toggleLoop,
    setSpeed,
    seek,
  };
};

export default useLottie;
