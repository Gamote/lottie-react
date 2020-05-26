import { DetailedHTMLProps, HTMLAttributes, MutableRefObject } from "react";

export type LottieOptionsType = {
	animationData: any,
	loop: any,
	autoplay: any,
	initialSegment: any,
	onComplete: any,
	onLoopComplete: any,
	onEnterFrame: any,
	onSegmentStart: any,
	onConfigReady: any,
	onDataReady: any,
	onDataFailed: any,
	onLoadedImages: any,
	onDOMLoaded: any,
	onDestroy: any,
};

export type HTMLDivElementProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type LottieComponentProps = LottieOptionsType & HTMLDivElementProps;

export type LottieRefCurrentType = {
	play: Function;
	stop: Function;
	pause: Function;
	setSpeed: Function;
	goToAndPlay: Function;
	goToAndStop: Function;
	setDirection: Function;
	playSegments: Function;
	setSubframe: Function;
	destroy: Function;
	getDuration: Function;
};

export type LottieRefType = MutableRefObject<LottieRefCurrentType>;
