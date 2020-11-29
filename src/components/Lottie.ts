import { useEffect } from "react";
import * as PropTypes from "prop-types";
import { LottieComponentProps } from "../types";
import useLottie from "../hooks/useLottie";
import useLottieInteractivity from "../hooks/useLottieInteractivity";

const Lottie = ({
  lottieRef,
  interactivity,
  listeners,
  containerProps,
  ...config
}: LottieComponentProps) => {
  const lottieObject = useLottie({
    listeners,
    containerProps,
    ...config,
  });

  /**
   * Make the lottie object available through the provided 'lottieRef'
   */
  useEffect(() => {
    if (lottieRef) {
      lottieRef.current = lottieObject;
    }
  }, [lottieRef?.current]);

  /**
   * Interactive view
   */
  if (interactivity) {
    return useLottieInteractivity({
      lottieObject,
      ...interactivity,
    });
  }

  return lottieObject.View;
};

Lottie.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.shape(undefined as any),
    PropTypes.string,
  ]).isRequired,
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
};

export default Lottie;
