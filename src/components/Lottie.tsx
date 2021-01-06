// import * as PropTypes from "prop-types";
import React, { forwardRef } from "react";
import useLottie from "../hooks/useLottie";
import useLottieInteractivity from "../hooks/useLottieInteractivity";
import { LottieComponentProps, LottieRefCurrentProps } from "../types";

const Lottie = forwardRef<LottieRefCurrentProps, LottieComponentProps>(
  (
    {
      lottieRef,
      interactivity,
      onEvent,
      onStateChange,
      containerProps,
      ...config
    },
    ref,
  ) => {
    const lottieObject = useLottie({
      onEvent,
      onStateChange,
      containerProps,
      ...config,
    });
    const { View } = lottieObject;

    /**
     * Make the player object available through the provided 'ref'
     */
    if (ref) {
      if (typeof ref === "function") {
        ref(lottieObject);
      } else {
        ref.current = lottieObject;
      }
    }

    /**
     * Make the lottie object available through the provided 'lottieRef'
     */
    if (lottieRef) {
      lottieRef.current = lottieObject.animationItem;
    }

    /**
     * Interactive view
     */
    const interactivityL = useLottieInteractivity({
      lottieObject,
      mode: "scroll",
      actions: [
        {
          visibility: [0, 0.2],
          type: "stop",
          frames: [0],
        },
        {
          visibility: [0.2, 0.45],
          type: "seek",
          frames: [0, 45],
        },
        {
          visibility: [0.45, 1.0],
          type: "loop",
          frames: [45, 60],
        },
      ],
      ...interactivity,
    });

    if (interactivity) {
      return interactivityL;
    }

    return View;
  },
);

// TODO: implement the new prop-type rules
// Lottie.propTypes = {
//   data: PropTypes.oneOfType([
//     PropTypes.shape(undefined as any),
//     PropTypes.string,
//   ]).isRequired,
//   loop: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
//   autoplay: PropTypes.bool,
//   initialSegment: PropTypes.arrayOf(PropTypes.number.isRequired),
//   onComplete: PropTypes.func,
//   onLoopComplete: PropTypes.func,
//   onEnterFrame: PropTypes.func,
//   onSegmentStart: PropTypes.func,
//   onConfigReady: PropTypes.func,
//   onDataReady: PropTypes.func,
//   onDataFailed: PropTypes.func,
//   onLoadedImages: PropTypes.func,
//   onDOMLoaded: PropTypes.func,
//   onDestroy: PropTypes.func,
// };
//
// Lottie.defaultProps = {
//   loop: true,
//   autoplay: true,
//   initialSegment: null,
//   onComplete: null,
//   onLoopComplete: null,
//   onEnterFrame: null,
//   onSegmentStart: null,
//   onConfigReady: null,
//   onDataReady: null,
//   onDataFailed: null,
//   onLoadedImages: null,
//   onDOMLoaded: null,
//   onDestroy: null,
// };

export default Lottie;
