import { useEffect } from "react";
import * as PropTypes from "prop-types";
import { LottieComponentProps } from "../types";
import useLottie from "../hooks/useLottie";
import useLottieInteractivity from "../hooks/useLottieInteractivity";

const Lottie = (props: LottieComponentProps) => {
  const { style, interactivity, ...lottieProps } = props;

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
    getDuration,
    destroy,
    animationLoaded,
    animationItem,
  } = useLottie(lottieProps, style);

  /**
   * Make the hook variables/methods available through the provided 'lottieRef'
   */
  useEffect(() => {
    if (props.lottieRef) {
      props.lottieRef.current = {
        play,
        stop,
        pause,
        setSpeed,
        goToAndPlay,
        goToAndStop,
        setDirection,
        playSegments,
        setSubframe,
        getDuration,
        destroy,
        animationLoaded,
        animationItem,
      };
    }
  }, [props.lottieRef?.current]);

  if (interactivity) {
    const EnhancedView = useLottieInteractivity({
      lottieObj: {
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
        getDuration,
        destroy,
        animationLoaded,
        animationItem,
      },
      ...interactivity,
    });

    return EnhancedView;
  }

  return View;
};

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
