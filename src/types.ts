import React, {
	MutableRefObject,
	AnimationEventHandler,
} from "react";
import {
	AnimationDirection, AnimationEventName, AnimationItem,
	AnimationSegment, CanvasRendererConfig, HTMLRendererConfig, SVGRendererConfig,
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
	getDuration: (inFrames?: boolean) => number | undefined;
	destroy: () => void;
	animationLoaded: boolean;
	animationItem: AnimationItem | undefined;
};

export type LottieRef = MutableRefObject<LottieRefCurrentProps | null>;

export type LottieOptions = {
	// TODO: replace this with `AnimationConfig` if possible
	animationData: object;
	renderer?: 'svg' | 'canvas' | 'html';
	loop?: boolean | number;
	autoplay?: boolean;
	name?: string;
	assetsPath?: string;
	rendererSettings?: SVGRendererConfig | CanvasRendererConfig | HTMLRendererConfig;
	initialSegment?: number[] | null;
} & {
	lottieRef?: LottieRef;
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

export type PartialLottieOptions = Omit<LottieOptions, 'animationData'> & {
	animationData?: LottieOptions["animationData"];
};

export type LottieComponentProps = LottieOptions & React.HTMLProps<HTMLDivElement>;

export type PartialLottieComponentProps = Omit<LottieComponentProps, 'animationData'> & {
	animationData?: LottieOptions["animationData"];
};

export type Listener = {
	name: AnimationEventName;
	handler: AnimationEventHandler;
};
export type PartialListener = Omit<Listener, "handler"> & {
	handler?: Listener["handler"] | null;
};