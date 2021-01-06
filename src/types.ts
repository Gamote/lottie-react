import {
  AnimationConfig,
  AnimationDirection,
  AnimationEventName,
  AnimationItem,
  AnimationSegment,
} from "lottie-web";
import React, {
  MutableRefObject,
  AnimationEventHandler,
  ReactElement,
} from "react";

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
  onComplete?: AnimationEventHandler | null;
  onLoopComplete?: AnimationEventHandler | null;
  onEnterFrame?: AnimationEventHandler | null;
  onSegmentStart?: AnimationEventHandler | null;
  onConfigReady?: AnimationEventHandler | null;
  onDataReady?: AnimationEventHandler | null;
  onDataFailed?: AnimationEventHandler | null;
  onLoadedImages?: AnimationEventHandler | null;
  onDOMLoaded?: AnimationEventHandler | null;
  onDestroy?: AnimationEventHandler | null;
};

export type Listener = {
  name: AnimationEventName;
  handler: AnimationEventHandler;
};
export type PartialListener = Omit<Listener, "handler"> & {
  handler?: Listener["handler"] | null;
};

export enum PlayerState {
  Loading = "loading",
  Playing = "playing",
  Paused = "paused",
  Stopped = "stopped",
  Frozen = "frozen",
  Error = "error",
}

export enum PlayerEvent {
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
 * Lottie configuration object
 */
type LottieConfig = Omit<AnimationConfig, "container"> & {
  data: boolean | any; // TODO: find a better way to describe: path or object
};

/**
 * Properties for the Lottie hook
 */
export type LottieHookProps = LottieConfig & {
  debug?: boolean;
  onEvent?: (eventName: PlayerEvent) => any;
  onStateChange?: (stateName: PlayerState) => any;
  containerProps?: React.HTMLProps<HTMLDivElement>;
};

/**
 * Properties for the Lottie component
 */
export type LottieComponentProps = LottieHookProps & {
  ref?: LottieRef;
  lottieRef?: MutableRefObject<AnimationItem | null>;
  interactivity?: Omit<InteractivityProps, "lottieObject">;
};

/**
 * Object found in `lottieRef`
 */
export type AnimationItemRef = MutableRefObject<AnimationItem | undefined>;

/**
 * Object returned by 'useLottie'
 */
export type LottieObject = { View: ReactElement } & LottieRefCurrentProps;

// Interactivity
export type Axis = "x" | "y";
export type Position = { [key in Axis]: number | [number, number] };

export type Action = {
  type: "seek" | "play" | "stop" | "loop";
  frames: [number] | [number, number];
  visibility?: [number, number];
  position?: Position;
};

export type InteractivityProps = {
  lottieObject: LottieObject;
  actions: Action[];
  mode: "scroll" | "cursor";
};
