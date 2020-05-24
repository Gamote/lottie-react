import { forwardRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import useLottie from "../hooks/useLottie";

const Lottie = forwardRef((props, ref) => {
	const { style, ...lottieProps } = props;
	const parentRef = ref || useRef();

	/**
	 * Initialize the 'useLottie' hook
	 */
	const {
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
	} = useLottie(lottieProps, style);

	/**
	 * Share methods which control Lottie to the parent component
	 */
	useEffect(() => {
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
	}, [parentRef.current]);

	return View;
});

Lottie.propTypes = {
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

Lottie.defaultProps = {
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

export default Lottie;
