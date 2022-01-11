import { Lottie, LottieHookOptions, LottieProps } from "lottie-react";
import React, { FC, useState } from "react";
import groovyWalkAnimation from "./../../static/assets/animations/groovyWalk.json";

const FullLottieTest: FC = () => {
  const config: LottieProps = {
    src: groovyWalkAnimation,
    loop: true,
    autoplay: true,
  };

  const [src, setSrc] = useState<LottieHookOptions["src"]>(config.src);
  const [loop, setLoop] = useState<LottieHookOptions["loop"]>(config.loop);
  const [autoplay, setAutoplay] = useState<LottieHookOptions["autoplay"]>(config.autoplay);

  // Delay
  const [delayAnimations, setDelayAnimations] = useState(true);

  // Show different animations
  const [showAnimationNumber, setShowAnimationNumber] = useState(2);

  // // Show animations after x milliseconds
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Showing animations");
  //     setDelayAnimations(true);
  //   }, 500);
  // }, []);
  //
  // // Show animation 1
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Showing div 1");
  //     setShowAnimationNumber(1);
  //   }, 1500);
  // }, []);
  //
  // // Show animation 2
  // useEffect(() => {
  //   setTimeout(() => {
  //     logger.info("> Showing div 2");
  //     setShowAnimationNumber(2);
  //   }, 2500);
  // }, []);

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
              <Lottie src={src} loop={loop} autoplay={autoplay} />
              Animation 1
            </>
          )}

          {showAnimationNumber === 2 && (
            <>
              <Lottie
                src={"https://assets5.lottiefiles.com/private_files/lf30_3ezlslmp.json"}
                // src={source}
                // src={"https://assets4.lottiefiles.com/packages/lf20_hslwihoj.json"}
                controls
                loop={loop}
                autoplay={autoplay}
                // onStateChange={(playerState) => {
                //   console.log(playerState);
                // }}
                // onEvent={(playerEvent) => {
                //   console.log(playerEvent);
                // }}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default FullLottieTest;
