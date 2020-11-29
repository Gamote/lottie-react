import {
  AnimationItemRef,
  Listener,
  LottieAnimationEvents,
  PartialListener,
} from "../types";
import { useEffect } from "react";

const useAnimationEvents = (
  { current: animationItem }: AnimationItemRef,
  animationEvents: LottieAnimationEvents = {},
) => {
  /**
   * Reinitialize listener on change
   */
  useEffect(() => {
    if (!animationItem) {
      return;
    }

    const partialListeners: PartialListener[] = [
      { name: "complete", handler: animationEvents.onComplete },
      { name: "loopComplete", handler: animationEvents.onLoopComplete },
      { name: "enterFrame", handler: animationEvents.onEnterFrame },
      { name: "segmentStart", handler: animationEvents.onSegmentStart },
      { name: "config_ready", handler: animationEvents.onConfigReady },
      { name: "data_ready", handler: animationEvents.onDataReady },
      { name: "data_failed", handler: animationEvents.onDataFailed },
      { name: "loaded_images", handler: animationEvents.onLoadedImages },
      { name: "DOMLoaded", handler: animationEvents.onDOMLoaded },
      { name: "destroy", handler: animationEvents.onDestroy },
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
        animationItem.addEventListener(listener.name, listener.handler);

        // Return a function to deregister this listener
        return () => {
          animationItem.removeEventListener(listener.name, listener.handler);
        };
      },
    );

    // Deregister listeners on unmount
    return () => {
      deregisterList.forEach((deregister) => deregister());
    };
  }, [
    animationItem,
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
