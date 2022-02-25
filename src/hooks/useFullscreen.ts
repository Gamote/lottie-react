import { RefObject, useLayoutEffect, useState } from "react";
import { getFullscreenInfo } from "../utils/getFullscreenInfo";
import logger from "../utils/logger";

export type UseFullscreenResult = {
  isFullscreen: boolean;
  toggleFullscreen: null | (() => Promise<void>);
};

/**
 * Hook that expose methods in order to use the Fullscreen API
 * Docs: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 * TODO:
 *  ~ should we return an `isCompatible` boolean or returning `toggleFullscreen` as `null` is enough?
 *  ~ check if there any performance penalty in calling `getFullscreenInfo` everytime we want full screen info.
 *    Maybe we can wrap all the props with functions? E.g.: from `fullscreenElement` to `getFullscreenElement`?
 *
 * @param ref
 */
export const useFullscreen = (ref?: RefObject<Element>): UseFullscreenResult => {
  const [isFullscreen, setIsFullscreen] = useState(!!getFullscreenInfo(ref)?.fullscreenElement);

  const toggleFullscreen = async () => {
    // Skip if no reference
    if (!ref?.current) {
      return;
    }

    // Skip if there is no browser support
    if (!getFullscreenInfo(ref)) {
      return;
    }

    // If it's full screen already, exit
    if (getFullscreenInfo(ref)?.fullscreenElement) {
      await getFullscreenInfo(ref)?.exitFullscreen();
      setIsFullscreen(false);
      return;
    }

    // Try to make it full screen
    try {
      await getFullscreenInfo(ref)?.requestFullscreen();
      setIsFullscreen(!!getFullscreenInfo(ref)?.fullscreenElement);
    } catch (e) {
      setIsFullscreen(false);
    }
  };

  /**
   * Listen for changes and update the local state
   */
  useLayoutEffect(() => {
    // Skip if there is no browser support
    if (!getFullscreenInfo(ref)) {
      return;
    }

    // Add listener
    getFullscreenInfo(ref)?.onFullscreenChange(() =>
      setIsFullscreen(!!getFullscreenInfo(ref)?.fullscreenElement),
    );

    // Remove the listener on unmount
    return () => {
      getFullscreenInfo(ref)?.onFullscreenChange(null);
    };
  });

  // Checks if the browser is compatible
  if (!getFullscreenInfo(ref)) {
    logger.warn(`Fullscreen API is not supported by this browser.`);

    return {
      isFullscreen,
      toggleFullscreen: null,
    };
  }

  return { isFullscreen, toggleFullscreen };
};
