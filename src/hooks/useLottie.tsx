import lottie, { AnimationItem } from "lottie-web";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ProgressBar from "../components/Progress/ProgressBar";
import {
  Listener,
  LottieHookProps,
  LottieObject,
  PlayerEvent,
  PlayerState,
} from "../types";

const useLottie = (props: LottieHookProps): LottieObject => {
  const { onEvent, onStateChange, containerProps, ...config } = props;

  const animationContainer = useRef<HTMLDivElement>(null);
  const [animationItem, setAnimationItem] = useState<AnimationItem | null>(
    null,
  );
  const [playerState, _setPlayerState] = useState<PlayerState>(
    PlayerState.Loading,
  );
  const [currentFrame, setCurrentFrame] = useState<number>(0);

  /**
   * On player state changes
   */
  const setPlayerState = (
    stateName: PlayerState,
    skipStateChangeListener?: boolean,
  ) => {
    _setPlayerState(stateName);

    if (
      !skipStateChangeListener &&
      onStateChange &&
      typeof onStateChange === "function"
    ) {
      onStateChange(stateName);
    }
  };

  /**
   * Trigger an event
   */
  const triggerEvent = (eventName: PlayerEvent) => {
    if (onEvent) {
      onEvent(eventName);
    }
  };

  /**
   * Initialize the animation and listen for changes that should reinitialised the animation
   * TODO: The reason of using useLayoutEffect is to wait for the 'animationContainer.current'.
   *  Can we use somehow use 'useEffect' instead?
   */
  useLayoutEffect((): (() => any) => {
    // eslint-disable-next-line no-console
    console.log("[LOTTIE REACT] ON ANIMATION LOAD");

    // Stop if the container is not ready
    //  TODO: is this needed when we're using 'useLayoutEffect'?
    if (!animationContainer.current) {
      return () => undefined;
    }

    // Load and save the animation instance
    const { data, ...rest } = config;

    // Initialise and load the Lottie animation
    let newAnimationItem: AnimationItem;

    if (!data || data.length < 1) {
      triggerEvent(PlayerEvent.Error);
      setPlayerState(PlayerState.Error);
      return () => undefined;
    }

    try {
      newAnimationItem = lottie.loadAnimation({
        ...rest,
        ...(typeof data === "string"
          ? { path: data }
          : { animationData: data }),
        container: animationContainer.current,
      });

      // Add event listeners
      const eventListeners: Listener[] = [
        {
          name: "complete",
          handler: () => {
            setPlayerState(PlayerState.Paused); // TODO: Should be 'stop' or 'complete'
            triggerEvent(PlayerEvent.Complete);
          },
        },
        {
          name: "loopComplete",
          handler: () => {
            triggerEvent(PlayerEvent.LoopCompleted);
          },
        },
        {
          name: "enterFrame",
          handler: () => {
            triggerEvent(PlayerEvent.Frame);

            if (newAnimationItem.currentFrame !== currentFrame) {
              setCurrentFrame(newAnimationItem.currentFrame);
            }
          },
        },
        { name: "segmentStart", handler: () => undefined },
        { name: "config_ready", handler: () => undefined },
        {
          name: "data_ready",
          handler: () => {
            triggerEvent(PlayerEvent.Ready);
          },
        },
        {
          name: "data_failed",
          handler: () => {
            setPlayerState(PlayerState.Error);
          },
        },
        { name: "loaded_images", handler: () => undefined },
        {
          name: "DOMLoaded",
          handler: () => {
            triggerEvent(PlayerEvent.Load);
            setPlayerState(PlayerState.Frozen); // TODO: is Frozen the right state?
          },
        },
        { name: "destroy", handler: () => undefined },
      ];

      const listenerDeregisterList = eventListeners.map(
        /**
         * Handle the process of adding an event listener
         * @param {Listener} listener
         * @return {Function} Function that deregister the listener
         */
        (listener) => {
          newAnimationItem?.addEventListener(listener.name, listener.handler);

          // Return a function to deregister this listener
          return () => {
            newAnimationItem?.removeEventListener(
              listener.name,
              listener.handler,
            );
          };
        },
      );

      // Save the animation item
      setAnimationItem(newAnimationItem);

      return () => {
        // eslint-disable-next-line no-console
        console.log("[LOTTIE REACT] ON ANIMATION UNMOUNT");

        // Cleanup: destroy any previous instance
        listenerDeregisterList.forEach((deregister) => deregister());
        newAnimationItem.destroy();
        setAnimationItem(null);
        setPlayerState(PlayerState.Loading);
      };
    } catch (e) {
      triggerEvent(PlayerEvent.Error);
      setPlayerState(PlayerState.Error);
    }

    return () => undefined;
  }, [config.data]);

  /**
   * State effects
   */
  // (Effect) Loop
  useEffect(() => {
    if (animationItem) {
      animationItem.loop = !!config.loop;
      setAnimationItem(animationItem);
    }
  }, [config.loop]);

  // (Effect) Autoplay
  useEffect(() => {
    if (animationItem) {
      animationItem.autoplay = Boolean(config.autoplay);
    }
  }, [config.autoplay]);

  // (Effect) Initial segment // TODO: to finish
  useEffect(() => {
    if (!animationItem) {
      return;
    }

    // When null should reset to default animation length
    if (!config.initialSegment) {
      animationItem.resetSegments(false);
      // TODO: find a way to increase the totalFrames to the max in the current loop
      return;
    }

    // If it's not a valid segment, do nothing
    if (
      !Array.isArray(config.initialSegment) ||
      !config.initialSegment.length
    ) {
      return;
    }

    // If the current position it's not in the new segment
    // set the current position to start
    if (
      animationItem.currentRawFrame < config.initialSegment[0] ||
      animationItem.currentRawFrame > config.initialSegment[1]
    ) {
      animationItem.currentRawFrame = config.initialSegment[0];
    }

    // Update the segment
    animationItem.setSegment(
      config.initialSegment[0],
      config.initialSegment[1],
    );
  }, [config.initialSegment]);

  /**
   * Interaction methods
   */
  // const interactionMethods = useInteractionMethods(animationItem);

  // (Method) Play
  const play = () => {
    if (animationItem) {
      triggerEvent(PlayerEvent.Play);

      animationItem.play();

      setPlayerState(PlayerState.Playing);
    }
  };

  // (Method) Pause
  const pause = () => {
    if (animationItem) {
      triggerEvent(PlayerEvent.Pause);

      animationItem.pause();

      setPlayerState(PlayerState.Paused);
    }
  };

  // (Method) Stop
  const stop = () => {
    if (animationItem) {
      triggerEvent(PlayerEvent.Stop);

      animationItem.goToAndStop(1);

      setPlayerState(PlayerState.Stopped);
    }
  };

  // (Method) Set player speed
  const setSpeed = (speed: number) => {
    animationItem?.setSpeed(speed);
  };

  // (Method) Set seeker
  const setSeeker = (seek: number, shouldPlay = false) => {
    if (!shouldPlay || playerState !== PlayerState.Playing) {
      animationItem?.goToAndStop(seek, true);
      setPlayerState(PlayerState.Paused);
    } else {
      animationItem?.goToAndPlay(seek, true);
      setPlayerState(PlayerState.Playing);
    }
  };

  /**
   * Build the animation view
   */
  const isLoading = playerState === PlayerState.Loading;
  const isError = playerState === PlayerState.Error;

  const View = (
    <>
      {isLoading && (
        <div {...containerProps}>
          <img
            style={{
              width: "100%",
              height: "100%",
              margin: 0,
              padding: 0,
            }}
            alt="Animation is loading..."
            src="https://svgshare.com/i/Sfy.svg"
            title=""
          />
        </div>
      )}

      {isError && (
        <div {...containerProps}>
          <img
            style={{
              width: "100%",
              height: "100%",
              margin: 0,
              padding: 0,
            }}
            alt="Animation error..."
            src="https://svgshare.com/i/Sgd.svg"
            title=""
          />
        </div>
      )}

      <div
        {...containerProps}
        style={{
          ...containerProps?.style,
          ...(isLoading || isError ? { display: "none" } : null),
        }}
        ref={animationContainer}
      />

      <div>
        {(playerState === PlayerState.Paused ||
          playerState === PlayerState.Stopped) && (
          <button type="button" onClick={() => play()}>
            Play
          </button>
        )}

        {playerState === PlayerState.Playing && (
          <button type="button" onClick={() => pause()}>
            Pause
          </button>
        )}

        {(playerState === PlayerState.Playing ||
          playerState === PlayerState.Paused) && (
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        )}

        {(playerState === PlayerState.Playing ||
          playerState === PlayerState.Paused) && (
          <button type="button" onClick={() => stop()}>
            Loop is {config.loop ? "on" : "off"}
          </button>
        )}

        <ProgressBar
          // TODO: add first frame
          currentFrames={currentFrame}
          totalFrames={(animationItem?.totalFrames || 1) - 1} // TODO: is there another way to cover the last frame?
          onChange={(progress, isDraggingEnded) => {
            setSeeker(
              progress,
              isDraggingEnded && playerState === PlayerState.Playing,
            );

            // If the consumer is not done dragging the progress indicator
            // set it back to what it was, because `setSeeker()` changed it
            // TODO: should we move the logic in `setSeeker()` and pass `isDraggingEnded`
            //  or create an `ON_HOLD` state and keep the previous state?
            if (!isDraggingEnded) {
              setPlayerState(playerState, true);
            }
          }}
        />
      </div>
    </>
  );

  return {
    View,

    play,
    pause,
    stop,
    setSpeed,
    setSeeker,

    animationItem,
  };
};

export default useLottie;
