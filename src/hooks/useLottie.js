import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";

const useLottie = (props, style = {}) => {
	const animationInstanceRef = useRef(null);
	const animationContainer = useRef(null);

	// Initialize on mount
	useEffect(() => {
		// Instantiate Lottie
		animationInstanceRef.current = lottie.loadAnimation({
			...props,
			container: animationContainer.current,
		});

		// Destroy the Lottie instance on unmount
		return () => {
			animationInstanceRef.current.destroy();
		};
		// eslint-disable-next-line
	}, []);
	
	// TODO: play
	
	// TODO: stop
	
	// TODO: pause
	
	// TODO: pause
	
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
	
	// TODO: goToAndStop
	
	// TODO: goToAndPlay
	
	// TODO: setDirection
	
	// TODO: setDirection
	
	/**
	 * TODO: complete
	 * @param segment
	 * @param force
	 */
	const playSegments = (segment, force = false) => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.playSegments(segment, force);
		}
	};
	
	// TODO: setSubframe
	
	// TODO: destroy
	
	// TODO: getDuration

	// Build the animation view
	const View = <div style={style} ref={animationContainer} />;

	return {
		View,
		setSpeed,
		playSegments,
	};
};

export default useLottie;
