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
 * Options for the playback direction
 */
export enum Direction {
  Right = "right",
  Left = "left",
}
