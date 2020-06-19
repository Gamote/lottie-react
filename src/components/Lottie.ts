import {
	forwardRef,
	useEffect,
	ForwardRefExoticComponent,
	PropsWithoutRef,
	RefAttributes,
} from "react";
import * as PropTypes from "prop-types";
import {
	LottieComponentProps,
	LottieRef,
	LottieRefCurrentProps,
} from "../types";
import useLottie from "../hooks/useLottie";

const Lottie: ForwardRefExoticComponent<
	PropsWithoutRef<LottieComponentProps> &
	RefAttributes<LottieRefCurrentProps>
> = forwardRef<LottieRefCurrentProps, LottieComponentProps>(
	(props, ref?) => {
		const { style, ...lottieProps } = props;

		// TODO: find a better was to specified the ref type
		//  instead of redefining
		const parentRef = ref as LottieRef;

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
		 * Share the hook methods with the parent component using 'ref'
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
		}, [parentRef?.current]);

		return View;
	},
);

Lottie.propTypes = {
	animationData: PropTypes.shape(undefined as any).isRequired,
	loop: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
	autoplay: PropTypes.bool,
	initialSegment: PropTypes.arrayOf(PropTypes.number.isRequired),
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
	style: PropTypes.shape(undefined as any),
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
	style: undefined,
};

export default Lottie;
