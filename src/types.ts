import {
  AnimationEventName,
  AnimationItem,
  AnimationSegment,
  CanvasRendererConfig,
  HTMLRendererConfig,
  SVGRendererConfig,
} from "lottie-web";
import { AnimationEventHandler, RefCallback, RefObject } from "react";

/**
 * Object returned by `useCallbackRef()`
 */
export type CallbackRefHookResult<T = unknown> = {
  ref: RefObject<T>;
  setRef: RefCallback<T>;
};

/**
 * Render types that Lottie supports
 */
export enum LottieRenderer {
  Svg = "svg",
  Html = "html",
  Canvas = "canvas",
}

/**
 * Enum with the LottiePlayer's states
 */
export enum LottieState {
  Loading = "loading",
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Frozen = "frozen",
  Error = "error",
}

/**
 * Enum with the LottiePlayer's events
 */
export enum LottieEvent {
  Load = "load",
  Error = "error",
  Ready = "ready",
  Play = "play",
  Pause = "pause",
  Stop = "stop",
  Freeze = "freeze",
  LoopCompleted = "loop_completed",
  Complete = "complete",
  Frame = "frame",
}

/**
 * Shape of the LottiePlayer's event listeners
 */
export type LottieEventListener = {
  name: AnimationEventName;
  handler: AnimationEventHandler;
};

/**
 * Options for the `useLottie()` hook
 *
 * These options are wrapping Lottie's config properties and adds
 * additional ones in order to have a better control over the animation
 */
export type LottieHookOptions<Renderer extends LottieRenderer = LottieRenderer.Svg> = {
  src: string | Record<string | number | symbol, unknown>;
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
  onEvent?: (event: LottieEvent) => void;
  onStateChange?: (state: LottieState) => void;
};

/**
 * Object returned by `useLottie()`
 */
export type LottieHookResult = {
  setContainerRef: RefCallback<HTMLDivElement>;
  animationItem: AnimationItem | null;
  state: LottieState;
  currentFrame: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  toggleLoop: () => void;
  setSpeed: (speed: number) => void;
  seek: (value: number | string, isSeekingEnded: boolean) => void;
};

/**
 * Options for the `useLottieState()` hook
 */
export type LottieStateHookOptions = {
  initialState: LottieState;
  onChange?: (previousState: undefined | LottieState, newState: LottieState) => void;
};

/**
 * Properties for the `Lottie` component
 */
export type LottieProps = LottieHookOptions & {
  controls?: boolean; // TODO: add array with what to display, e.g ["play", "pause" etc.]
};

// Interactivity TODO: adapt once the interactivity is rewritten
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
