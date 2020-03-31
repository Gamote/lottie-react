import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";

const Animator = props => {
	const animationInstanceRef = useRef(null);
	const animationContainer = useRef(null);
	
	// Initialize Lottie
	useEffect(() => {
		animationInstanceRef.current = lottie.loadAnimation({
			...props.options,
			container: animationContainer.current,
		});

		// eslint-disable-next-line
	}, []);

	return <div style={props.style} ref={animationContainer} />;
};

export default Animator;
