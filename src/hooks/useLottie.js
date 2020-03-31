import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";

const useLottie = (props, style = {}) => {
	const animationInstanceRef = useRef(null);
	const animationContainer = useRef(null);

	/**
	 * Setup LottieAnimator
	 */
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

	const setSpeed = speed => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.setSpeed(speed);
		}
	};

	const playSegments = (segment, force = false) => {
		if (animationInstanceRef.current) {
			animationInstanceRef.current.playSegments(segment, force);
		}
	};

	const View = <div style={style} ref={animationContainer} />;

	return {
		View,
		setSpeed,
		playSegments,
	};
};

export default useLottie;
