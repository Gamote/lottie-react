import React, { FC, useEffect, useState } from "react";
import { Lottie, LottieHookOptions, LottieProps } from "../../../src";
import logger from "../../../src/utils/logger";
import groovyWalkAnimation from "./../../static/assets/animations/groovyWalk.json";

const FullLottieTest: FC = () => {
  const config: LottieProps = {
    source: groovyWalkAnimation,
    loop: true,
    autoplay: true,
  };

  const [source, setSource] = useState<LottieHookOptions["source"]>(config.source);
  const [loop, setLoop] = useState<LottieHookOptions["loop"]>(config.loop);
  const [autoplay, setAutoplay] = useState<LottieHookOptions["autoplay"]>(config.autoplay);

  // Delay
  const [delayAnimations, setDelayAnimations] = useState(false);

  // Show different animations
  const [showAnimationNumber, setShowAnimationNumber] = useState(0);

  // Show animations after x milliseconds
  useEffect(() => {
    setTimeout(() => {
      logger.info("> Showing animations");
      setDelayAnimations(true);
    }, 500);
  }, []);

  // Show animation 1
  useEffect(() => {
    setTimeout(() => {
      logger.info("> Showing div 1");
      setShowAnimationNumber(1);
    }, 1500);
  }, []);

  // Show animation 2
  useEffect(() => {
    setTimeout(() => {
      logger.info("> Showing div 2");
      setShowAnimationNumber(2);
    }, 2500);
  }, []);

  // Change autoplay
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Changing the autoplay");
  //     setAutoplay(true);
  //   }, 2700);
  // }, []);

  // Change source
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Changing the animation source");
  //     setSource("https://assets1.lottiefiles.com/packages/lf20_fgltupfx.json");
  //   }, 3500);
  // }, []);

  // Change loop
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Changing the loop");
  //     setLoop(false);
  //   }, 4500);
  // }, []);

  // Show missing animation
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Showing missing animation");
  //     setShowAnimationNumber(999);
  //   }, 4500);
  // }, []);

  return (
    <>
      {delayAnimations && (
        <>
          {showAnimationNumber === 1 && (
            <>
              <Lottie source={source} loop={loop} autoplay={autoplay} />
              Animation 1
            </>
          )}

          {showAnimationNumber === 2 && (
            <>
              <Lottie
                source={source}
                loop={loop}
                autoplay={autoplay}
                // onPlayerStateChange={(playerState) => {
                //   console.log(playerState);
                // }}
                // onPlayerEvent={(playerEvent) => {
                //   console.log(playerEvent);
                // }}
              />
            </>
          )}
        </>
      )}
    </>
  );

  return;
};

export default FullLottieTest;
