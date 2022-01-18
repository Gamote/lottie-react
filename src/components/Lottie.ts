import { useEffect } from "react";
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
    animationContainerRef,
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
        animationContainerRef,
        animationLoaded,
        animationItem,
      };
    }
  }, [props.lottieRef?.current]);

  if (interactivity) {
    return useLottieInteractivity({
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
        animationContainerRef,
        animationLoaded,
        animationItem,
      },
      ...interactivity,
    });
  }

  return View;
};

export default Lottie;
