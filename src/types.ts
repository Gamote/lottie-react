import {
  AnimationItem,
  AnimationSegment,
  CanvasRendererConfig,
  HTMLRendererConfig,
  SVGRendererConfig,
} from "lottie-web";
import { AnimationEventHandler, MutableRefObject, RefCallback } from "react";
import { LottiePlayerEvent, LottiePlayerState } from "./hooks/useLottiePlayer";

/**
 * Render types that Lottie supports
 */
enum LottieRenderer {
  Svg = "svg",
  Html = "html",
  Canvas = "canvas",
}

/**
 * Lottie options for the `useLottie()` hook
 *
 * These options are wrapping Lottie's config properties and adds
 * additional ones in order to have a better control over the animation
 */
export type LottieHookOptions<Renderer extends LottieRenderer = LottieRenderer.Svg> = {
  source: string | Record<string | number | symbol, unknown>;
  // renderer?: Renderer; // TODO: add support
  loop?: boolean | number;
  autoplay?: boolean;
  initialSegment?: AnimationSegment;
  assetsPath?: string;
  rendererSettings?: {
    svg: SVGRendererConfig;
    canvas: CanvasRendererConfig;
    html: HTMLRendererConfig;
  }[Renderer];
  // audioFactory?(assetPath: string): { // TODO: add support
  //   play(): void;
  //   seek(): void;
  //   playing(): void;
  //   rate(): void;
  //   setVolume(): void;
  // };

  debug?: boolean;
  // onPlayerEvent?: (eventName: PlayerEvent) => any;
  // onPlayerStateChange?: (stateName: PlayerState) => any;
  // containerProps?: HTMLProps<HTMLDivElement>; // TODO: to be moved to the LottieProps
};

/**
 * Object returned by `useLottie()`
 */
export type LottieHookResult = {
  setContainerRef: RefCallback<HTMLDivElement>;
  // isLoading: boolean;
  // isError: boolean;
  animationItem: AnimationItem | null;
};

/**
 * Properties for the `Lottie` component
 * TODO: wip
 */
export type LottieProps = LottieHookOptions & {
  // ref?: TODO: reference for the container, it needs to be combined with the one we already have
  lottieRef?: MutableRefObject<AnimationItem | null>;

  onPlayerEvent?: (playerState: LottiePlayerEvent) => void;
  onPlayerStateChange?: (playerState: LottiePlayerState) => void;

  interactivity?: Omit<InteractivityProps, "lottieObject">;
};

/**
 * Interaction methods
 */
export type LottieInteractionMethods = {
  play: () => void;
  stop: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setSeeker: (seek: number, shouldPlay: boolean) => void;
  // goToAndStop: (value: number, isFrame?: boolean) => void;
  // goToAndPlay: (value: number, isFrame?: boolean) => void;
  // setDirection: (direction: AnimationDirection) => void;
  // playSegments: (
  //   segments: AnimationSegment | AnimationSegment[],
  //   forceFlag?: boolean,
  // ) => void;
  // setSubframe: (useSubFrames: boolean) => void;
  // getDuration: (inFrames?: boolean) => number | undefined;
  // destroy: () => void;
};

/**
 * Object found in 'lottieRef.current'
 */
export type LottieRefCurrentProps = {
  animationItem: AnimationItem | null;
} & LottieInteractionMethods;

/**
 * Object found in `lottieRef`
 */
export type LottieRef = MutableRefObject<LottieRefCurrentProps | null>;

/**
 * Lottie animation events
 */
export type LottieAnimationEvents = {
  onComplete?: AnimationEventHandler;
  onLoopComplete?: AnimationEventHandler;
  onEnterFrame?: AnimationEventHandler;
  onSegmentStart?: AnimationEventHandler;
  onConfigReady?: AnimationEventHandler;
  onDataReady?: AnimationEventHandler;
  onDataFailed?: AnimationEventHandler;
  onLoadedImages?: AnimationEventHandler;
  onDOMLoaded?: AnimationEventHandler;
  onDestroy?: AnimationEventHandler;
};

// Interactivity TODO: adapt
export type Axis = "x" | "y";
export type Position = { [key in Axis]: number | [number, number] };

export type Action = {
  type: "seek" | "play" | "stop" | "loop";
  frames: [number] | [number, number];
  visibility?: [number, number];
  position?: Position;
};

export type InteractivityProps = {
  lottieObject: LottieHookResult;
  actions: Action[];
  mode: "scroll" | "cursor";
};
