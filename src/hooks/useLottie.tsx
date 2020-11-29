import React, { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { LottieHookProps, LottieObject } from "../types";
import useInteractionMethods from "./useInteractionMethods";
import useAnimationEvents from "./useAnimationEvents";

const useLottie = (props: LottieHookProps): LottieObject => {
  const { listeners, containerProps, ...config } = props;

  const animationContainer = useRef<HTMLDivElement>(null);
  const animationItemRef = useRef<AnimationItem>();

  const [animationLoaded, setAnimationLoaded] = useState<boolean>(false);

  /**
   * Interaction methods
   */
  const interactionMethods = useInteractionMethods(animationItemRef);

  /**
   * Animation events
   */
  useAnimationEvents(animationItemRef, listeners);

  /**
   * Load a new animation, and if it's the case, destroy the previous one
   * @param {Object} forcedConfig
   */
  const loadAnimation = (forcedConfig = {}) => {
    // Return if the container ref is null
    if (!animationContainer.current) {
      return;
    }

    // Destroy any previous instance
    animationItemRef.current?.destroy();

    const { data, ...rest } = config;

    // Save the animation instance
    animationItemRef.current = lottie.loadAnimation({
      ...rest,
      ...(typeof data === "string"
        ? { path: data }
        : { animationData: data }),
      ...forcedConfig,
      container: animationContainer.current,
    });

    setAnimationLoaded(!!animationItemRef.current);
  };

  /**
   * Initialize and listen for changes that should reinitialised the animation
   */
  useEffect(() => {
    loadAnimation();
  }, [config.data]);

  /**
   * Update the loop state
   */
  useEffect(() => {
    if (!animationItemRef.current) {
      return;
    }

    animationItemRef.current.loop = !!config.loop;

    if (config.loop && animationItemRef.current.isPaused) {
      animationItemRef.current.play();
    }
  }, [config.loop]);

  /**
   * Update the autoplay state
   */
  useEffect(() => {
    if (!animationItemRef.current) {
      return;
    }

    animationItemRef.current.autoplay = !!config.autoplay;
  }, [config.autoplay]);

  /**
   * Update the initial segment state
   */
  useEffect(() => {
    if (!animationItemRef.current) {
      return;
    }

    // When null should reset to default animation length
    if (!config.initialSegment) {
      animationItemRef.current.resetSegments(false);
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
      animationItemRef.current.currentRawFrame < config.initialSegment[0] ||
      animationItemRef.current.currentRawFrame > config.initialSegment[1]
    ) {
      animationItemRef.current.currentRawFrame = config.initialSegment[0];
    }

    // Update the segment
    animationItemRef.current.setSegment(
      config.initialSegment[0],
      config.initialSegment[1],
    );
  }, [config.initialSegment]);

  /**
   * Build the animation view
   */
  const View = <div {...containerProps} ref={animationContainer} />;

  return {
    View,
    ...interactionMethods,
    animationLoaded,
    animationItem: animationItemRef.current,
  };
};

export default useLottie;
