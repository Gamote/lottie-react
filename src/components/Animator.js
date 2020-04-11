import React, { forwardRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import lottie from "lottie-web";

const Animator = forwardRef((props, ref) => {
	const { animationData, loop, autoplay, initialSegment, style } = props;
	const animationContainer = useRef(null);
	const animationInstanceRef = useRef(null);
	const parentRef = ref || useRef();

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

	/**
	 * Load a new animation, and if it's the case, destroy the previous one
	 * @param forceOptions
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
	style: PropTypes.shape(undefined),
};

Animator.defaultProps = {
	loop: true,
	autoplay: true,
	initialSegment: null,
	style: null,
};

export default Animator;
