import {
  AnimationEventName,
  AnimationItem,
  AnimationSegment,
  CanvasRendererConfig,
  HTMLRendererConfig,
  SVGRendererConfig,
} from "lottie-web";
import { AnimationEventHandler, RefCallback, RefObject } from "react";
import { SubscriptionManager } from "../utils/SubscriptionManager";
import {
  Direction,
  LottieRenderer,
  LottieState,
  LottieSubscription,
  LottieVersion,
  PlayerControlsElement,
} from "./enums";

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
 * Options for the `useLottieFactory()` hook
 *
 * These options are wrapping Lottie's config properties and ads
 * additional ones in order to have a better control over the animation
 */
export type UseLottieFactoryOptions<Version extends LottieVersion = LottieVersion.Full> = {
  src: string | Record<string | number | symbol, unknown>;
  initialValues?: {
    loop?: boolean | number;
    direction?: Direction;
    speed?: number;
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
  changeDirection: (direction: Direction) => void;
  speed: number;
  changeSpeed: (speed: number) => void;
  seek: (value: number | string, isSeekingEnded: boolean) => void;
  subscribe: SubscriptionManager<LottieSubscriptions>["subscribe"];
  totalFrames: number;
  direction: Direction;
};

/**
 * Options for the `useLottieState()` hook
 */
export type UseLottieStateOptions = {
  initialState: LottieState;
  onChange?: (previousState: undefined | LottieState, newState: LottieState) => void;
};

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
