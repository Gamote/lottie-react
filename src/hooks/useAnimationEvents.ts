import { useEffect } from "react";
import {
  AnimationItemRef,
  Listener,
  LottieAnimationEvents,
  PartialListener,
} from "../types";

export const addEventListeners = (
  animationItemRef: AnimationItemRef,
  animationEvents: LottieAnimationEvents = {},
) => {
  // eslint-disable-next-line no-console
  console.log("[LOTTIE REACT] ON EVENT LOAD", animationItemRef?.current);

  if (!animationItemRef || !animationItemRef.current) {
    return () => undefined;
  }

  const partialListeners: PartialListener[] = [
    { name: "complete", handler: animationEvents.onComplete },
    { name: "loopComplete", handler: animationEvents.onLoopComplete },
    { name: "enterFrame", handler: animationEvents.onEnterFrame },
    { name: "segmentStart", handler: animationEvents.onSegmentStart },
    { name: "config_ready", handler: animationEvents.onConfigReady },
    {
      name: "data_ready",
      handler: () => {
        return animationEvents.onDataReady;
      },
    },
    { name: "data_failed", handler: animationEvents.onDataFailed },
    { name: "loaded_images", handler: animationEvents.onLoadedImages },
    {
      name: "DOMLoaded",
      handler: () => {
        return animationEvents.onDOMLoaded;
      },
    },
    {
      name: "destroy",
      handler: () => {
        return animationEvents.onDestroy;
      },
    },
  ];

  const listeners = partialListeners.filter(
    (listener: PartialListener): listener is Listener =>
      listener.handler != null,
  );

  if (!listeners.length) {
    return () => undefined;
  }

  const deregisterList = listeners.map(
    /**
     * Handle the process of adding an event listener
     * @param {Listener} listener
     * @return {Function} Function that deregister the listener
     */
    (listener) => {
      animationItemRef.current?.addEventListener(
        listener.name,
        listener.handler,
      );

      // Return a function to deregister this listener
      return () => {
        animationItemRef.current?.removeEventListener(
          listener.name,
          listener.handler,
        );
      };
    },
  );

  // Deregister listeners on unmount
  return () => {
    // eslint-disable-next-line no-console
    console.log("[LOTTIE REACT] ON EVENT UNLOAD", animationItemRef?.current);

    deregisterList.forEach((deregister) => deregister());
  };
};

const useAnimationEvents = (
  animationItemRef: AnimationItemRef,
  animationEvents: LottieAnimationEvents = {},
) => {
  /**
   * Reinitialize listener on change
   */
  useEffect(() => addEventListeners(animationItemRef, animationEvents), [
    // TODO: should we keep this in here?
    // animationItemRef?.current,
    // TODO: should use just 'animationEvents'?
    animationEvents.onComplete,
    animationEvents.onLoopComplete,
    animationEvents.onEnterFrame,
    animationEvents.onSegmentStart,
    animationEvents.onConfigReady,
    animationEvents.onDataReady,
    animationEvents.onDataFailed,
    animationEvents.onLoadedImages,
    animationEvents.onDOMLoaded,
    animationEvents.onDestroy,
  ]);
};

export default useAnimationEvents;
