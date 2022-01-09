import { useCallback, useEffect, useState } from "react";
import {
  LottiePlayerEvent,
  LottiePlayerEventListener,
  LottiePlayerHookResult,
  LottiePlayerOptions,
  LottiePlayerState,
} from "../types";
import getNumberFromNumberOrPercentage from "../utils/getNumberFromNumberOrPercentage";
import isFunction from "../utils/isFunction";
import logger from "../utils/logger";
import useLottiePlayerState from "./useLottiePlayerState";

/**
 * Hook that take offer player capabilities to animation
 *
 * It takes care of registering event listeners and then
 * use them to create an easy-to-use Player state that
 * can later be used by the UI
 * @param options
 */
const useLottiePlayer = (options?: LottiePlayerOptions): LottiePlayerHookResult => {
  const { animationItem, onPlayerEvent, onPlayerStateChange } = options ?? {};

  // State of the player
  const { previousPlayerState, playerState, setPlayerState } = useLottiePlayerState({
    initialState: LottiePlayerState.Loading,
    onChange: (previousPlayerState, newPlayerState) => {
      if (onPlayerStateChange && isFunction(onPlayerStateChange)) {
        onPlayerStateChange(newPlayerState);
      }
    },
  });

  // State of the current frame
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [playerStateBeforeSeeking, setPlayerStateBeforeSeeking] =
    useState<LottiePlayerState | null>(null);

  /**
   * Trigger an event
   * @param eventName
   */
  const triggerEvent = useCallback(
    (eventName: LottiePlayerEvent) => {
      if (onPlayerEvent) {
        onPlayerEvent(eventName);
      }
    },
    [onPlayerEvent],
  );

  /**
   * Register the events when whe have a new animation item
   */
  useEffect(
    () => {
      if (!animationItem) {
        logger.log("⌛️ Player doesn't have the animation item yet", animationItem);
        return;
      }

      // Indicate that the player is loading
      setPlayerState(LottiePlayerState.Loading);

      // Add event listeners to the animation
      const listeners: LottiePlayerEventListener[] = [
        {
          name: "complete",
          handler: () => {
            setPlayerState(LottiePlayerState.Stopped);
            triggerEvent(LottiePlayerEvent.Complete);
          },
        },
        {
          name: "loopComplete",
          handler: () => {
            triggerEvent(LottiePlayerEvent.LoopCompleted);
          },
        },
        {
          name: "enterFrame",
          handler: () => {
            triggerEvent(LottiePlayerEvent.Frame);
            if (animationItem.currentFrame !== currentFrame) {
              setCurrentFrame(animationItem.currentFrame);
            }
          },
        },
        { name: "segmentStart", handler: () => undefined },
        { name: "config_ready", handler: () => undefined },
        {
          name: "data_ready",
          handler: () => {
            triggerEvent(LottiePlayerEvent.Ready);
          },
        },
        {
          name: "data_failed",
          handler: () => {
            setPlayerState(LottiePlayerState.Error);
          },
        },
        { name: "loaded_images", handler: () => undefined },
        {
          name: "DOMLoaded",
          handler: () => {
            triggerEvent(LottiePlayerEvent.Load);
            setPlayerState(
              animationItem.autoplay ? LottiePlayerState.Playing : LottiePlayerState.Stopped,
            );
          },
        },
        { name: "destroy", handler: () => undefined },
      ];

      logger.log("👂 Registering the event listeners");

      // Attach event listeners and return functions to deregister them
      const listenerDeregisterList = listeners.map((listener) => {
        try {
          animationItem?.addEventListener(listener.name, listener.handler);
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
            animationItem?.removeEventListener(listener.name, listener.handler);
          } catch (e) {
            // * There might be cases in which the `animationItem` exists but
            // * it was destroyed, and in that case `removeEventListener` will
            // * throw an error. That's why we skip these errors.
            // TODO: check if `lottie-web` offers a way to check if the animation
            //  is able to remove events
          }
        };
      });

      // Cleanup on unmount
      return () => {
        logger.log("🧹 Lottie Player is unloading, cleaning up...");
        listenerDeregisterList.forEach((deregister) => deregister());
        setPlayerState(LottiePlayerState.Loading);
      };
    },
    // * We are disabling the `exhaustive-deps` here because we want to
    // * re-render only when the `animationItem` changes
    // ! DON'T CHANGE because we will end up unnecessary re-registering the events
    // ! listeners which might affect the performance and the player's functionality
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationItem],
  );

  /**
   * Interaction methods
   */
  // Play
  const play = () => {
    if (animationItem) {
      animationItem.play();
      setPlayerState(LottiePlayerState.Playing);
      triggerEvent(LottiePlayerEvent.Play);
    }
  };

  // Pause
  const pause = () => {
    if (animationItem) {
      animationItem.pause();
      setPlayerState(LottiePlayerState.Paused);
      triggerEvent(LottiePlayerEvent.Pause);
    }
  };

  // Stop
  const stop = () => {
    if (animationItem) {
      animationItem.goToAndStop(1);
      setPlayerState(LottiePlayerState.Stopped);
      triggerEvent(LottiePlayerEvent.Stop);
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
  const setSeeker = (value: number | string, isSeekingEnded = false) => {
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
    if (!isSeekingEnded && !playerStateBeforeSeeking) {
      setPlayerStateBeforeSeeking(playerState);
    } else if (isSeekingEnded && playerStateBeforeSeeking) {
      setPlayerStateBeforeSeeking(null);
    }

    const shouldPlayAfter =
      isSeekingEnded &&
      (playerState === LottiePlayerState.Playing ||
        playerStateBeforeSeeking === LottiePlayerState.Playing);

    if (shouldPlayAfter) {
      animationItem?.goToAndPlay(frame, true);
      setPlayerState(LottiePlayerState.Playing);
    } else {
      animationItem?.goToAndStop(frame, true);

      if (playerState !== LottiePlayerState.Stopped) {
        setPlayerState(LottiePlayerState.Paused);
      }
    }
  };

  return {
    playerState,
    currentFrame,
    play,
    pause,
    stop,
    setSpeed,
    setSeeker,
  };
};

export default useLottiePlayer;
