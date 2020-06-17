import {
	DetailedHTMLProps,
	HTMLAttributes,
	MutableRefObject,
	AnimationEventHandler,
	CSSProperties,
} from "react";
import {
	AnimationDirection,
	AnimationSegment,
} from "lottie-web";

export type LottieOptionsType = {
	animationData: object;
	loop?: boolean | number;
	autoplay?: boolean;
	initialSegment?: number[] | null;
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

export type LottieComponentProps = LottieOptionsType & {
	style?: CSSProperties;
};

export type LottieRefCurrentType = {
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

export type LottieRefType = MutableRefObject<LottieRefCurrentType>;
