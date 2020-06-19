import React, {
	AnimationEventHandler,
	CSSProperties,
	useEffect,
	useRef,
	ReactElement,
} from "react";
import lottie, {
	AnimationConfigWithData,
	AnimationEventName,
	AnimationItem,
	AnimationDirection,
	AnimationSegment,
} from "lottie-web";
import { LottieOptions, LottieRefCurrentProps } from "../types";

type Listener = {
	name: AnimationEventName;
	handler: AnimationEventHandler;
};
type PartialListener = Omit<Listener, "handler"> & {
	handler?: Listener["handler"] | null;
};

const useLottie = (
	props: LottieOptions,
	style: CSSProperties | undefined = undefined,
): { View: ReactElement } & LottieRefCurrentProps => {
	const {
		animationData,
		loop,
		autoplay,
		initialSegment,
		onComplete,
		onLoopComplete,
		onEnterFrame,
		onSegmentStart,
		onConfigReady,
		onDataReady,
		onDataFailed,
		onLoadedImages,
		onDOMLoaded,
		onDestroy,
	} = props;

	const animationInstanceRef = useRef<AnimationItem>();
	const animationContainer = useRef<HTMLDivElement>(null);

	/*
		======================================
			INTERACTION METHODS
		======================================
	 */

	/**
	 * Play
	 * TODO: complete
	 */
	const play = (): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.play();
		}
	};

	/**
	 * Stop
	 * TODO: complete
	 */
	const stop = (): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.stop();
		}
	};

	/**
	 * Pause
	 * TODO: complete
	 */
	const pause = (): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.pause();
		}
	};

	/**
	 * Set animation speed
	 * TODO: complete
	 * @param speed
	 */
	const setSpeed = (speed: number): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.setSpeed(speed);
		}
	};

	/**
	 * Got to frame and play
	 * TODO: complete
	 * @param value
	 * @param isFrame
	 */
	const goToAndPlay = (value: number, isFrame?: boolean): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.goToAndPlay(value, isFrame);
		}
	};

	/**
	 * Got to frame and stop
	 * TODO: complete
	 * @param value
	 * @param isFrame
	 */
	const goToAndStop = (value: number, isFrame?: boolean): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.goToAndStop(value, isFrame);
		}
	};

	/**
	 * Set animation direction
	 * TODO: complete
	 * @param direction
	 */
	const setDirection = (direction: AnimationDirection): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.setDirection(direction);
		}
	};

	/**
	 * Play animation segments
	 * TODO: complete
	 * @param segments
	 * @param forceFlag
	 */
	const playSegments = (
		segments: AnimationSegment | AnimationSegment[],
		forceFlag?: boolean,
	): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.playSegments(segments, forceFlag);
		}
	};

	/**
	 * Set sub frames
	 * TODO: complete
	 * @param useSubFrames
	 */
	const setSubframe = (useSubFrames: boolean): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.setSubframe(useSubFrames);
		}
	};

	/**
	 * Destroy animation
	 * TODO: complete
	 */
	const destroy = (): void => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.destroy();
		}
	};

	/**
	 * Get animation duration
	 * TODO: complete
	 * @param inFrames
	 */
	const getDuration = (inFrames?: boolean): number | undefined => {
		if (animationInstanceRef.current) {
			return animationInstanceRef.current.getDuration(inFrames);
		}

		return undefined;
	};

	/*
		======================================
			LOTTIE
		======================================
	 */

	/**
	 * Load a new animation, and if it's the case, destroy the previous one
	 * @param {Object} forcedConfigs
	 */
	const loadAnimation = (forcedConfigs = {}) => {
		// Return if the container ref is null
		if (!animationContainer.current) {
			return;
		}

		// Destroy any previous instance
		if (animationInstanceRef.current) {
			animationInstanceRef.current.destroy();
		}

		// Build the animation configuration
		const config: AnimationConfigWithData = {
			...props,
			...forcedConfigs,
			container: animationContainer.current,
		};

		// Save the animation instance
		animationInstanceRef.current = lottie.loadAnimation(config);
	};

	/**
	 * Initialize and listen for changes that need to reinitialize Lottie
	 */
	useEffect(() => {
		loadAnimation();
	}, [animationData, loop, autoplay, initialSegment]);

	/*
		======================================
			EVENTS
		======================================
	 */

	/**
	 * Handle the process of adding an event listener
	 * @param {AnimationEventName} eventName
	 * @param {AnimationEventHandler} eventHandler
	 * @return {Function} Function that deregister the listener
	 */
	const addEventListenerHelper = (
		eventName: AnimationEventName,
		eventHandler: AnimationEventHandler,
	): Function => {
		if (animationInstanceRef.current && eventName && eventHandler) {
			animationInstanceRef.current.addEventListener(
				eventName,
				eventHandler,
			);

			// Return a function to deregister this listener
			return () => {
				animationInstanceRef.current?.removeEventListener(
					eventName,
					eventHandler,
				);
			};
		}

		return () => {};
	};

	/**
	 * Reinitialize listener on change
	 */
	useEffect(() => {
		const partialListeners: PartialListener[] = [
			{ name: "complete", handler: onComplete },
			{ name: "loopComplete", handler: onLoopComplete },
			{ name: "enterFrame", handler: onEnterFrame },
			{ name: "segmentStart", handler: onSegmentStart },
			{ name: "config_ready", handler: onConfigReady },
			{ name: "data_ready", handler: onDataReady },
			{ name: "data_failed", handler: onDataFailed },
			{ name: "loaded_images", handler: onLoadedImages },
			{ name: "DOMLoaded", handler: onDOMLoaded },
			{ name: "destroy", handler: onDestroy },
		];
		const listeners = partialListeners.filter(
			(listener: PartialListener): listener is Listener => (
				listener.handler != null
			)
		);
		if (!listeners.length) { return undefined; }

		const deregisterList = listeners.map((event) =>
			addEventListenerHelper(event.name, event.handler),
		);

		// Deregister listeners on unmount
		return () => {
			deregisterList.forEach((deregister) => deregister());
		};
	}, [
		onComplete,
		onLoopComplete,
		onEnterFrame,
		onSegmentStart,
		onConfigReady,
		onDataReady,
		onDataFailed,
		onLoadedImages,
		onDOMLoaded,
		onDestroy,
	]);

	/**
	 * Build the animation view
	 */
	const View = <div style={style} ref={animationContainer} />;

	return {
		View,
		play,
		stop,
		pause,
		setSpeed,
		goToAndStop,
		goToAndPlay,
		setDirection,
		playSegments,
		setSubframe,
		destroy,
		getDuration,
	};
};

export default useLottie;
