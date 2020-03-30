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

		// FIX for https://github.com/airbnb/lottie-web/issues/2064#issue-588704630
		// TODO: this can be removed when the issue will be fixed
		animationInstanceRef.current.addEventListener("DOMLoaded", () => {
			if (
				props.initialSegment &&
				!Number.isNaN(props.initialSegment[0]) > 0 &&
				!Number.isNaN(props.initialSegment[1])
			) {
				animationInstanceRef.current.totalFrames = Math.floor(
					props.initialSegment[1] - props.initialSegment[0],
				);
				animationInstanceRef.current.firstFrame = Math.round(
					props.initialSegment[0],
				);
			}
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
