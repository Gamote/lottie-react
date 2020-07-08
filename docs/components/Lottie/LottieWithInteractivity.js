import React, { useRef, useEffect } from "react";
import Lottie from "../../../src/components/Lottie";
import groovyWalkAnimation from "../../assets/groovyWalk.json";

const style = {
  height: 300,
  border: 3,
  borderStyle: "solid",
  borderRadius: 7,
};

const viewport = [0, 1];

function getContainerVisibility(container) {
  const { top, height } = container.getBoundingClientRect();

  const current = window.innerHeight - top;
  const max = window.innerHeight + height;
  return current / max;
}

const LottieWithInteractivity = () => {
  const containerRef = useRef();
  const lottieRef = useRef();

  useEffect(() => {
    if (containerRef.current && lottieRef.current) {
      const container = containerRef.current;
      const { getDuration, goToAndStop } = lottieRef.current;

      const totalFrames = getDuration(true);

      const scrollHandler = () => {
        const currentPercent = getContainerVisibility(container);

        const isInView =
          currentPercent >= viewport[0] && currentPercent <= viewport[1];

        if (isInView) {
          goToAndStop(
            Math.ceil(
              ((currentPercent - viewport[0]) / (viewport[1] - viewport[0])) *
                totalFrames,
            ),
            true,
          );
        }
      };

      document.addEventListener("scroll", scrollHandler);

      return () => {
        document.removeEventListener("scroll", scrollHandler);
      };
    }

    return () => {};
  }, [containerRef.current, lottieRef.current]);

  return (
    <div ref={containerRef}>
      <Lottie
        lottieRef={lottieRef}
        animationData={groovyWalkAnimation}
        style={style}
        loop={false}
        autoplay={false}
      />
    </div>
  );
};

export default LottieWithInteractivity;
