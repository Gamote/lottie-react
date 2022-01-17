import {
  AnimationEventName,
  AnimationItem,
  AnimationSegment,
  CanvasRendererConfig,
  HTMLRendererConfig,
  SVGRendererConfig,
} from "lottie-web";
import { AnimationEventHandler, RefCallback, RefObject } from "react";
import { SubscriptionManager } from "./utils/SubscriptionManager";

/**
 * Object returned by `useCallbackRef()`
 */
export type UseCallbackRefResult<T = unknown> = {
  ref: RefObject<T>;
  setRef: RefCallback<T>;
};

/**
 * Shape of the internal listener
 */
export type InternalListener = {
  name: AnimationEventName;
  handler: AnimationEventHandler;
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
 * Enum with Lottie's subscription types
 */
export enum LottieSubscription {
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
 * The generic type for the subscription's action
 */
export type LottieSubscriptionAction<T = unknown> = (event: T) => void;

/**
 * Describing the action to take for each subscription type
 */
export type LottieSubscriptions = {
  [LottieSubscription.Frame]: LottieSubscriptionAction<{ currentFrame: number }>;
  [LottieSubscription.Complete]: LottieSubscriptionAction;
  [LottieSubscription.LoopCompleted]: LottieSubscriptionAction;
  [LottieSubscription.Ready]: LottieSubscriptionAction;
  [LottieSubscription.Play]: LottieSubscriptionAction;
  [LottieSubscription.Pause]: LottieSubscriptionAction;
  [LottieSubscription.Stop]: LottieSubscriptionAction;
  [LottieSubscription.Failure]: LottieSubscriptionAction;
  [LottieSubscription.NewState]: LottieSubscriptionAction<{ state: LottieState }>;
};

/**
 * Enum with animation's versions which are `full` and `light`
 */
export enum LottieVersion {
  Full = "full",
  Light = "light",
}

/**
 * Render types that animation supports
 */
export enum LottieRenderer {
  Svg = "svg",
  Html = "html",
  Canvas = "canvas",
}

/**
 * Options for the `useLottieFactory()` hook
 *
 * These options are wrapping Lottie's config properties and ads
 * additional ones in order to have a better control over the animation
 */
export type UseLottieFactoryOptions<Version extends LottieVersion = LottieVersion.Full> = {
  src: string | Record<string | number | symbol, unknown>;
  initialValues?: {
    loop?: boolean | number;
    autoplay?: boolean;
    segment?: AnimationSegment;
    assetsPath?: string;
  };
  enableReinitialize?: boolean;
  debug?: boolean;
  subscriptions?: Partial<LottieSubscriptions>;

  // TODO: add support for the following
  // audioFactory?(assetPath: string): {
  //   play(): void;
  //   seek(): void;
  //   playing(): void;
  //   rate(): void;
  //   setVolume(): void;
  // };
} & (
  | {
      renderer?: LottieRenderer.Svg;
      rendererSettings?: SVGRendererConfig;
    }
  | (Version extends LottieVersion.Full
      ?
          | {
              renderer?: LottieRenderer.Canvas;
              rendererSettings?: CanvasRendererConfig;
            }
          | {
              renderer?: LottieRenderer.Html;
              rendererSettings?: HTMLRendererConfig;
            }
      : never)
);

/**
 * Object returned by `useLottieFactory()`
 */
export type UseLottieFactoryResult = {
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
  subscribe: SubscriptionManager<LottieSubscriptions>["subscribe"];
  totalFrames: number;
};

/**
 * Options for the `useLottieState()` hook
 */
export type UseLottieStateOptions = {
  initialState: LottieState;
  onChange?: (previousState: undefined | LottieState, newState: LottieState) => void;
};

/**
 * Enum with the PlayerControls' elements
 */
export enum PlayerControlsElement {
  Play = "play",
  Pause = "pause",
  Stop = "stop",
  FramesIndicator = "framesIndicator",
  ProgressBar = "progressBar",
  Loop = "loop",
  FullScreen = "fullScreen",
  PlaybackSpeed = "playbackSpeed",
  Direction = "direction",
}

/**
 * Type for Lottie's `ref` property
 */
export type LottieRef = Omit<UseLottieFactoryResult, "setContainerRef">;

/**
 * Properties for the `Lottie` & `LottieLight` components
 */
export type LottieProps<Version extends LottieVersion = LottieVersion.Full> =
  UseLottieFactoryOptions<Version> & {
    controls?: boolean | PlayerControlsElement[];
    LoadingOverlay?: JSX.Element;
    FailureOverlay?: JSX.Element;
    LoadingOverlayContent?: JSX.Element;
    FailureOverlayContent?: JSX.Element;
  };
