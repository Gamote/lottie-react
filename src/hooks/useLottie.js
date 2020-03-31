import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";

const useLottie = (props, style = {}) => {
	const animationInstanceRef = useRef(null);
	const animationContainer = useRef(null);

	// Initialize Lottie
	useEffect(() => {
		animationInstanceRef.current = lottie.loadAnimation({
			...props,
			container: animationContainer.current,
		});
		
		// eslint-disable-next-line
	}, []);

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

	// Build the animation view
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
