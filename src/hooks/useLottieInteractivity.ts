import { AnimationItem } from "lottie-web";
import { RefObject } from "react";
import logger from "../utils/logger";

// TODO: Describe and move to `types`
export type InteractivityOptions = {
  mode: "scroll";
  actions: {
    visibility: [number, number];
    type: "stop" | "seek" | "loop";
    frames: number[];
  }[];
};

// TODO: Describe and move to `types`
export type UseLottieInteractivityOptions = {
  containerRef: RefObject<Element>;
  animationItem: AnimationItem | null;
  options: InteractivityOptions;
};

/**
 * Heavily inspired by https://lottiefiles.com/interactivity
 */
export const useLottieInteractivity = ({
  containerRef,
  animationItem,
  options,
}: UseLottieInteractivityOptions) => {
  logger.log("Interactivity", {
    containerRef,
    animationItem,
    options,
  });

  // Not ready
  if (!containerRef || !animationItem || !options) {
    return;
  }
};
