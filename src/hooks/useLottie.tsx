import lottie, { AnimationItem } from "lottie-web";
import { useEffect, useState } from "react";
import { LottieHookOptions, LottieHookResult } from "../types";
import logger from "../utils/logger";
import normalizeAnimationSource from "../utils/normalizeAnimationSource";
import useCallbackRef from "./useCallbackRef";

const useLottie = (options: LottieHookOptions): LottieHookResult => {
  const { source, loop, autoplay, initialSegment, assetsPath, rendererSettings, debug } = options;

  // Create a Ref that will trigger a rerender when its value change
  const { ref: containerRef, setRef: setContainerRef } = useCallbackRef<HTMLDivElement>();

  // Animation instance
  const [animationItem, setAnimationItem] = useState<AnimationItem | null>(null);

  /**
   * Load the animation and reload when the container and/or source change
   */
  useEffect(
    () => {
      logger.log("🪄 Trying to load the animation");

      // Skip if the container is not ready
      if (!containerRef?.current) {
        logger.log("⌛️ The container is not ready yet");
        return;
      }

      // Destroy any previous animation
      if (animationItem) {
        logger.log("🗑 Animation already loaded, destroying it");
        animationItem.destroy();
      }

      // TODO: look into web-workers

      // Validate the animation source
      const normalizedAnimationSource = normalizeAnimationSource(source);

      if (!normalizedAnimationSource) {
        logger.log("😥 Animation source is not valid");
        // triggerEvent(PlayerEvent.Error);
        // setPlayerState(PlayerState.Error);
        return;
      }

      try {
        // Load animation
        const _animationItem = lottie.loadAnimation({
          ...normalizedAnimationSource,
          container: containerRef.current,
          loop,
          autoplay,
          initialSegment,
          assetsPath,
          rendererSettings,
        });

        logger.log("🎉 Animation was loaded", _animationItem);

        // Save the animation item
        setAnimationItem(_animationItem);

        // Cleanup sequence on unmount
        return () => {
          logger.log("🧹 Lottie is unloading, cleaning up...");
          _animationItem.destroy();
          setAnimationItem(null);
        };
      } catch (e) {
        logger.log("⚠️ Error while trying to load animation");
        // TODO: check if we need to propagate this, maybe it will be useful for the player
        //  or not, and the player can say: "No animation loaded..."
        // triggerEvent(PlayerEvent.Error);
        // setPlayerState(PlayerState.Error);
      }
    },
    // * We are disabling the `exhaustive-deps` here because we want to
    // * re-render only when the container ref and/or the source change
    // ! DON'T CHANGE because we will end up having the "Maximum update depth exceeded" error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef.current, source],
  );

  /**
   * Animation config effects
   * Each effect is taking care of an individual setting
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

  return {
    setContainerRef,
    animationItem,
  };
};

export default useLottie;
