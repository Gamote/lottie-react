import React, { forwardRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import lottie from "lottie-web";

const Animator = forwardRef((props, ref) => {
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
		style,
	} = props;
	const animationContainer = useRef(null);
	const animationInstanceRef = useRef(null);
	const parentRef = ref || useRef();

	/*
		======================================
			INTERACTION METHODS
		======================================
	 */

	/**
	 * Play
	 * TODO: complete
	 */
	const play = () => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.play();
		}
	};

	/**
	 * Stop
	 * TODO: complete
	 */
	const stop = () => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.stop();
		}
	};

	/**
	 * Pause
	 * TODO: complete
	 */
	const pause = () => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.pause();
		}
	};

	/**
	 * Set animation speed
	 * TODO: complete
	 * @param speed
	 */
	const setSpeed = speed => {
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
	const goToAndPlay = (value, isFrame) => {
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
	const goToAndStop = (value, isFrame) => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.goToAndStop(value, isFrame);
		}
	};

	/**
	 * Set animation direction
	 * TODO: complete
	 * @param direction
	 */
	const setDirection = direction => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.setDirection(direction);
		}
	};

	/**
	 * Play animation segments
	 * TODO: complete
	 * @param segment
	 * @param force
	 */
	const playSegments = (segment, force) => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.playSegments(segment, force);
		}
	};

	/**
	 * Set sub frames
	 * TODO: complete
	 * @param useSubFrames
	 */
	const setSubframe = useSubFrames => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.setSubframe(useSubFrames);
		}
	};

	/**
	 * Destroy animation
	 * TODO: complete
	 */
	const destroy = () => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.destroy();
		}
	};

	/**
	 * Get animation duration
	 * TODO: complete
	 * @param inFrames
	 */
	const getDuration = inFrames => {
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
	 * @param {Object} forceOptions
	 */
	const loadAnimation = (forceOptions = {}) => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.destroy();
		}

		const config = {
			animationData: animationData || null,
			loop: !Number.isNaN(loop) ? loop : loop !== false,
			autoplay: autoplay !== false,
			initialSegment: initialSegment || null,
			// ...props, // TODO: check if you should allow this
			...forceOptions,
			container: animationContainer.current,
		};

		animationInstanceRef.current = lottie.loadAnimation(config);

		// Share methods which control Lottie to the parent component
		if (parentRef) {
			parentRef.current = {
				play,
				stop,
				pause,
				setSpeed,
				goToAndPlay,
				goToAndStop,
				setDirection,
				playSegments,
				setSubframe,
				destroy,
				getDuration,
			};
		}
	};

	// Initialize and listen for changes that need to reinitialize Lottie
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
	 * @param {String} eventName
	 * @param {Function} eventHandler
	 * @param {Boolean} removePreviousListeners
	 * @return {Function} Function that deregister the listener
	 */
	const addEventListenerHelper = (
		eventName,
		eventHandler,
		removePreviousListeners = false,
	) => {
		if (animationInstanceRef.current) {
			if (removePreviousListeners) {
				animationInstanceRef.current.removeEventListener(eventName);
			}

			if (eventName && eventHandler) {
				animationInstanceRef.current.addEventListener(
					eventName,
					eventHandler,
				);

				// Return a function to deregister the event
				return () => {
					// TODO: Should we remove all the listeners?
					animationInstanceRef.current.removeEventListener(
						eventName,
						eventHandler,
					);
				};
			}
		}

		return () => {};
	};

	useEffect(() => {
		const listeners = [
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

		const deregisterList = listeners.map(event =>
			addEventListenerHelper(event.name, event.handler),
		);

		// Deregister events on unmount
		return () => {
			deregisterList.forEach(deregister => deregister());
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
	 * ALPHA
	 */
	// Detect changes of the loop param and change it without reloading the animation
	// TODO: needs intensive testing
	// useEffect(() => {
	// 	if (animationInstanceRef.current.loop !== loop) {
	// 		animationInstanceRef.current.loop = loop;
	// 	}
	//
	// 	// // TODO: decide if this is a desired behavior
	// 	// if (animationInstanceRef.current.isPaused) {
	// 	// 	animationInstanceRef.current.play();
	// 	// }
	// }, [loop]);

	return <div ref={animationContainer} style={style} />;
});

Animator.propTypes = {
	animationData: PropTypes.shape(undefined).isRequired,
	loop: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
	autoplay: PropTypes.bool,
	initialSegment: PropTypes.arrayOf(
		PropTypes.shape(PropTypes.number.isRequired),
	),
	onComplete: PropTypes.func,
	onLoopComplete: PropTypes.func,
	onEnterFrame: PropTypes.func,
	onSegmentStart: PropTypes.func,
	onConfigReady: PropTypes.func,
	onDataReady: PropTypes.func,
	onDataFailed: PropTypes.func,
	onLoadedImages: PropTypes.func,
	onDOMLoaded: PropTypes.func,
	onDestroy: PropTypes.func,
	style: PropTypes.shape(undefined),
};

Animator.defaultProps = {
	loop: true,
	autoplay: true,
	initialSegment: null,
	onComplete: null,
	onLoopComplete: null,
	onEnterFrame: null,
	onSegmentStart: null,
	onConfigReady: null,
	onDataReady: null,
	onDataFailed: null,
	onLoadedImages: null,
	onDOMLoaded: null,
	onDestroy: null,
	style: null,
};

export default Animator;
