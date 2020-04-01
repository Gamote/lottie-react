import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import lottie from "lottie-web";

const Animator = props => {
	const { animationData, loop, autoplay, initialSegment, style } = props;
	const animationContainer = useRef(null);
	const animationInstanceRef = useRef(null);

	// Helper that load a new animation, and if it's the case, destroy the previous one
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
	};

	// Initialize and listen for changes that need to reinitialize Lottie
	useEffect(() => {
		loadAnimation();
	}, [animationData, loop, autoplay, initialSegment]);

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

	return <div style={style} ref={animationContainer} />;
};

Animator.propTypes = {
	animationData: PropTypes.shape(undefined).isRequired,
	loop: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
	autoplay: PropTypes.bool,
	initialSegment: PropTypes.arrayOf(
		PropTypes.shape(PropTypes.number.isRequired),
	),
	style: PropTypes.shape(undefined),
};

Animator.defaultProps = {
	loop: true,
	autoplay: true,
	initialSegment: null,
	style: null,
};

export default Animator;
