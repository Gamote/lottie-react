import { AnimationConfig, AnimationItem, AnimationSegment, LottiePlayer } from "lottie-web";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import {
  InternalListener,
  LottieSubscriptions,
  UseLottieFactoryOptions,
  UseLottieFactoryResult,
  Direction,
  LottieRenderer,
  LottieState,
  LottieSubscription,
  LottieVersion,
} from "../@types";
import { SubscriptionManager } from "../utils/SubscriptionManager";
import getNumberFromNumberOrPercentage from "../utils/getNumberFromNumberOrPercentage";
import logger from "../utils/logger";
import normalizeAnimationSource from "../utils/normalizeAnimationSource";
import useCallbackRef from "./useCallbackRef";
import useStateWithPrevious from "./useStateWithPrevious";

/**
 * Lottie's animation factory hook
 * @param options
 * @param lottie
 */
export const useLottieFactory = <Version extends LottieVersion = LottieVersion.Full>(
  lottie: LottiePlayer,
  { src, enableReinitialize = false, ...rest }: UseLottieFactoryOptions<Version>,
): UseLottieFactoryResult => {
  const options = {
    enableReinitialize,
    ...rest,
  };

  // (Ref) Animation's container
  // By using a callback ref, a rerender will be trigger when its value changed
  // this way the consumer have the option to set the container, and we know
  // when, and if, the animation should be (re)loaded
  // TODO: can't we just use `useState()`?
  const { ref: containerRef, setRef: setContainerRef } = useCallbackRef<HTMLDivElement>();

  // (State) Animation instance
  const [animationItem, setAnimationItem] = useState<AnimationItem | null>(null);

  // (State) Subscription manager
  const subscriptionManager = useMemo(() => new SubscriptionManager<LottieSubscriptions>(), []);

  // (State) Animation's state
  const { state, setState } = useStateWithPrevious<LottieState>({
    initialState: LottieState.Loading,
    onChange: (previousPlayerState, newPlayerState) => {
      // Let the subscribers know about the new state
      subscriptionManager.notify(LottieSubscription.NewState, { state: newPlayerState });
    },
  });

  // (Ref) Initial values provided by the consumer
  const _initialValues = useRef(options.initialValues);
  const _subscriptions = useRef<Partial<LottieSubscriptions> | undefined>(undefined);

  // (State) Initial states converted to local states
  const [loop, setLoop] = useState<boolean | number>(options.initialValues?.loop || false);
  const [autoplay, setAutoplay] = useState<boolean>(options.initialValues?.autoplay || false);
  const [direction, setDirection] = useState<Direction>(
    options.initialValues?.direction || Direction.Right,
  );
  const [speed, setSpeed] = useState<number>(options.initialValues?.speed || 1);
  const [initialSegment, setInitialSegment] = useState<AnimationSegment | undefined>(
    options.initialValues?.segment || undefined,
  );

  // (State) Animation's state before seeking
  // By keeping this we can pause the animation while the seeking action is
  // happening and return to it immediately, offering a smooth experience
  const [stateBeforeSeeking, setStateBeforeSeeking] = useState<LottieState | null>(null);

  /**
   * (Re)initialize the animation when the container and/or source change
   */
  useEffect(
    () => {
      logger.log("🪄 Trying to (re)initialize the animation");

      // Set the state to loading until the animation is (re)initialized
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
        subscriptionManager.notify(LottieSubscription.Failure, undefined);
        setState((prevState) =>
          prevState === LottieState.Failure ? prevState : LottieState.Failure,
        );
        return;
      }

      // Initialize animation
      let _animationItem: AnimationItem;

      try {
        _animationItem = lottie.loadAnimation({
          ...normalizedAnimationSource,
          container: containerRef.current,
          renderer: options.renderer ?? LottieRenderer.Svg, // TODO: rerender when changes
          rendererSettings: options.rendererSettings, // TODO: rerender when changes?
          loop,
          autoplay,
          initialSegment,
          assetsPath: _initialValues.current?.assetsPath,
        } as AnimationConfig); // TODO: remove the type annotation when `lottie-web` allow us to use generics
      } catch (e) {
        logger.warn("⚠️ Error while trying to load animation", e);
        subscriptionManager.notify(LottieSubscription.Failure, undefined);
        setState((prevState) =>
          prevState === LottieState.Failure ? prevState : LottieState.Failure,
        );
        return;
      }

      // Save Lottie's animation item
      logger.log("👌 Animation was initialized", _animationItem);
      setAnimationItem(_animationItem);

      // Register the internal listeners for the animation's events
      const registerInternalListeners = () => {
        const internalListeners: InternalListener[] = [
          {
            name: "complete",
            handler: () => {
              // Reset the current frame to `0`
              _animationItem.goToAndStop(0);

              setState(LottieState.Stopped);
              subscriptionManager.notify(LottieSubscription.Complete, undefined);
            },
          },
          {
            name: "loopComplete",
            handler: () => {
              subscriptionManager.notify(LottieSubscription.LoopCompleted, undefined);
            },
          },
          {
            name: "enterFrame",
            handler: () => {
              if (_animationItem) {
                subscriptionManager.notify(LottieSubscription.Frame, {
                  currentFrame: _animationItem.currentFrame,
                });
              }
            },
          },
          { name: "segmentStart", handler: () => undefined },
          { name: "config_ready", handler: () => undefined },
          {
            name: "data_ready",
            handler: () => {
              subscriptionManager.notify(LottieSubscription.Ready, undefined);
            },
          },
          {
            name: "data_failed",
            handler: () => {
              setState(LottieState.Failure);
            },
          },
          { name: "loaded_images", handler: () => undefined },
          {
            name: "DOMLoaded",
            handler: () => {
              setState(_animationItem?.autoplay ? LottieState.Playing : LottieState.Stopped);
            },
          },
          { name: "destroy", handler: () => undefined },
        ];

        const internalListenerRemovers = internalListeners.map((listener) => {
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

        logger.log("👂 Internal listeners were registered");

        // Return a function to unregister all the listeners
        return () => {
          internalListenerRemovers.forEach((deregister) => deregister());
        };
      };

      const unregisterInternalListeners = registerInternalListeners();

      // Cleanup sequence on unmount
      return () => {
        logger.log("🧹 Animation is unloading, cleaning up...");
        unregisterInternalListeners();
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
    // or the initial values are the same with the previous ones
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
      // * Typing is wrong in `lottie-web`; loop can accept boolean AND number
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      animationItem.loop = newState;
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

    // Direction
    setDirection((prevState) => {
      // Skip update if equal
      if (_initialValues.current?.direction === prevState) {
        return prevState;
      }

      animationItem.setDirection(_initialValues.current?.direction === Direction.Right ? 1 : -1);
      return _initialValues.current?.direction === Direction.Right
        ? _initialValues.current?.direction
        : Direction.Left;
    });

    // Direction
    setSpeed((prevState) => {
      // Skip update if equal
      if (_initialValues.current?.speed === prevState) {
        return prevState;
      }

      const newState = _initialValues.current?.speed ?? 1;
      animationItem.setSpeed(newState);
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
   * Checks for and (re)register the consumer's subscriptions
   */
  useEffect(() => {
    // Skip update if there is no subscription manager
    // or the new subscriptions are the same with the previous ones
    if (!subscriptionManager || isEqual(_subscriptions.current, options.subscriptions)) {
      return;
    }

    // Save the new subscriptions
    _subscriptions.current = options.subscriptions;

    // Register consumer's subscriptions
    const unregisterConsumerSubscriptions = subscriptionManager.addSubscriptions(
      options.subscriptions,
    );

    logger.log("👂 Consumer's subscriptions were registered");

    return () => {
      logger.log("🧹 Unregistering consumer's subscriptions...");
      unregisterConsumerSubscriptions();
    };
  }, [subscriptionManager, options.subscriptions]);

  /**
   * Interaction methods
   */
  // Play
  const play = useCallback(() => {
    if (animationItem) {
      // If direction is `Left` and the animation is completed, play from the
      if (animationItem.currentFrame <= 0 && direction === Direction.Left) {
        animationItem.goToAndPlay(animationItem.totalFrames, true);
      } else {
        animationItem.play();
      }

      setState(LottieState.Playing);
      subscriptionManager.notify(LottieSubscription.Play, undefined);
    }
  }, [animationItem, direction, setState, subscriptionManager]);

  // Pause
  const pause = useCallback(() => {
    if (animationItem) {
      animationItem.pause();
      setState(LottieState.Paused);
      subscriptionManager.notify(LottieSubscription.Pause, undefined);
    }
  }, [animationItem, subscriptionManager, setState]);

  // Stop
  const stop = useCallback(() => {
    if (animationItem) {
      animationItem.goToAndStop(0);
      setState(LottieState.Stopped);
      subscriptionManager.notify(LottieSubscription.Stop, undefined);
    }
  }, [animationItem, subscriptionManager, setState]);

  // Toggle looping
  const toggleLoop = useCallback(() => {
    if (animationItem) {
      animationItem.loop = !animationItem.loop;
      setLoop(animationItem.loop);
    }
  }, [animationItem]);

  // Set playback direction
  const changeDirection = useCallback(
    (direction: Direction) => {
      if (animationItem) {
        setDirection(direction);
        animationItem?.setDirection(direction === Direction.Right ? 1 : -1);
      }
    },
    [animationItem],
  );

  // Set player speed TODO: this
  const changeSpeed = useCallback(
    (speed: number) => {
      if (animationItem) {
        setSpeed(speed);
        animationItem?.setSpeed(speed);
      }
    },
    [animationItem],
  );

  /**
   * Change the current frame from the animation
   * @param value Can be a frame number on a percentage (e.g. 12 or "14%")
   * @param isSeekingEnded Indicate if we should resume the player state from before seeking
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
            // If the seeking ended at frame `0` set the state to `Stopped`
            if (isSeekingEnded && frame === 0) {
              return LottieState.Stopped;
            }

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
    containerRef,
    setContainerRef,
    animationItem,
    state,
    subscribe: subscriptionManager.subscribe,
    totalFrames: animationItem?.totalFrames ?? 0,
    direction,
    loop,
    play,
    pause,
    stop,
    toggleLoop,
    changeDirection,
    speed,
    changeSpeed,
    seek,
  };
};
