import React, {
	MutableRefObject,
	AnimationEventHandler,
} from "react";
import {
	AnimationDirection,
	AnimationSegment,
} from "lottie-web";

export type LottieRefCurrentProps = {
	play: () => void;
	stop: () => void;
	pause: () => void;
	setSpeed: (speed: number) => void;
	goToAndStop: (value: number, isFrame?: boolean) => void;
	goToAndPlay: (value: number, isFrame?: boolean) => void;
	setDirection: (direction: AnimationDirection) => void;
	playSegments: (segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean) => void;
	setSubframe: (useSubFrames: boolean) => void;
	destroy: () => void;
	getDuration: (inFrames?: boolean) => number | undefined;
};

export type LottieRef = MutableRefObject<LottieRefCurrentProps>;

export type LottieOptions = {
	// TODO: replace this with `AnimationConfig`
	animationData: object;
	loop?: boolean | number;
	autoplay?: boolean;
	initialSegment?: number[] | null;
} & {
	ref?: LottieRef;
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

export type LottieComponentProps = React.HTMLProps<HTMLDivElement> &
	LottieOptions;
