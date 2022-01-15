import {
  AnimationEventName,
  AnimationItem,
  AnimationSegment,
  CanvasRendererConfig,
  HTMLRendererConfig,
  SVGRendererConfig,
} from "lottie-web";
import { AnimationEventHandler, RefCallback, RefObject } from "react";
import { LottieEventEmitter } from "./utils/LottieEventEmitter";

/**
 * Object returned by `useCallbackRef()`
 */
export type CallbackRefHookResult<T = unknown> = {
  ref: RefObject<T>;
  setRef: RefCallback<T>;
};

/**
 * Render types that Lottie's animation supports
 */
export enum AnimationRenderer {
  Svg = "svg",
  Html = "html",
  Canvas = "canvas",
}

/**
 * Enum with the Lottie's events
 */
export enum LottieEvent {
  Load = "load",
  Failure = "failure",
  Ready = "ready",
  Play = "play",
  Pause = "pause",
  Stop = "stop",
  Freeze = "freeze",
  LoopCompleted = "loop_completed",
  Complete = "complete",
  Frame = "frame",
  NewState = "new_state",
}

/**
 * The generic type of event's handler
 */
export type LottieEventHandler<T = unknown> = (event: T) => void;

/**
 * Definition on what each event is going to receive
 */
export type LottieEvents = {
  [LottieEvent.Frame]: LottieEventHandler<{ currentFrame: number }>;
  [LottieEvent.Complete]: LottieEventHandler;
  [LottieEvent.LoopCompleted]: LottieEventHandler;
  [LottieEvent.Ready]: LottieEventHandler;
  [LottieEvent.Play]: LottieEventHandler;
  [LottieEvent.Pause]: LottieEventHandler;
  [LottieEvent.Stop]: LottieEventHandler;
  [LottieEvent.Failure]: LottieEventHandler;
  [LottieEvent.NewState]: LottieEventHandler<{ state: LottieState }>;
};

/**
 * Enum with the Lottie's states
 */
export enum LottieState {
  Loading = "loading",
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Frozen = "frozen",
  Failure = "failure",
}

/**
 * Shape of the Lottie's event listeners
 */
export type AnimationEventListener = {
  name: AnimationEventName;
  handler: AnimationEventHandler;
};

/**
 * Options for the `useLottie()` hook
 *
 * These options are wrapping Lottie's config properties and ads
 * additional ones in order to have a better control over the animation
 */
export type LottieHookOptions<Renderer extends AnimationRenderer = AnimationRenderer.Svg> = {
  src: string | Record<string | number | symbol, unknown>;
  initialValues?: {
    loop?: boolean | number;
    autoplay?: boolean;
    segment?: AnimationSegment;
    assetsPath?: string;
    rendererSettings?: {
      svg: SVGRendererConfig;
      canvas: CanvasRendererConfig;
      html: HTMLRendererConfig;
    }[Renderer];
  };
  enableReinitialize?: boolean;
  debug?: boolean;
  eventListeners?: Partial<LottieEvents>;

  // TODO: add support for the following
  // renderer?: Renderer;
  // audioFactory?(assetPath: string): {
  //   play(): void;
  //   seek(): void;
  //   playing(): void;
  //   rate(): void;
  //   setVolume(): void;
  // };
};

/**
 * Object returned by `useLottie()`
 */
export type LottieHookResult = {
  setContainerRef: RefCallback<HTMLDivElement>;
  animationItem: AnimationItem | null;
  state: LottieState;
  loop: boolean | number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  toggleLoop: () => void;
  setSpeed: (speed: number) => void;
  seek: (value: number | string, isSeekingEnded: boolean) => void;
  eventSubscriber: LottieEventEmitter["on"];
  totalFrames: number;
};

/**
 * Options for the `useLottieState()` hook
 */
export type LottieStateHookOptions = {
  initialState: LottieState;
  onChange?: (previousState: undefined | LottieState, newState: LottieState) => void;
};

/**
 * Enum with the PlayerControls' elements
 */
export enum PlayerControlsElement {
  Play = "play",
  Pause = "pause",
  FramesIndicator = "framesIndicator",
  ProgressBar = "progressBar",
  Loop = "loop",
}

/**
 * Properties for the `Lottie` component
 */
export type LottieProps = LottieHookOptions & {
  controls?: boolean | PlayerControlsElement[];
  LoadingOverlay?: JSX.Element;
  FailureOverlay?: JSX.Element;
  LoadingOverlayContent?: JSX.Element;
  FailureOverlayContent?: JSX.Element;
};
