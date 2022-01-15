import { Lottie, LottieProps, PlayerControlsElement } from "lottie-react";
import React, { FC, useEffect, useState } from "react";
import logger from "../../../src/utils/logger";
import groovyWalkAnimation from "./../../static/assets/animations/groovyWalk.json";

const FullLottieTest: FC = () => {
  const config: LottieProps = {
    src: groovyWalkAnimation,
    initialValues: {
      loop: true,
      autoplay: true,
    },
  };

  const [src, setSrc] = useState(config.src);
  const [loop, setLoop] = useState(config.initialValues.loop);
  const [autoplay, setAutoplay] = useState(config.initialValues.autoplay);

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
  useEffect(() => {
    setTimeout(() => {
      logger.info("> Changing the animation source");
      setSrc("https://assets1.lottiefiles.com/packages/lf20_fgltupfx.json");
    }, 4000);
  }, []);

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
              <Lottie
                src={src}
                initialValues={{
                  loop,
                  autoplay,
                }}
              />
              Animation 1
            </>
          )}

          {showAnimationNumber === 2 && (
            <>
              <Lottie
                // src={"https://assets5.lottiefiles.com/private_files/lf30_3ezlslmp.json"}
                // src={source}
                // src={"https://assets4.lottiefiles.com/packages/lf20_hslwihoj.json"}
                src={src}
                initialValues={{
                  loop,
                  autoplay,
                }}
                enableReinitialize={true}
                // controls={[PlayerControlsElement.Play, PlayerControlsElement.ProgressBar, PlayerControlsElement.Loop]}
                controls
                listeners={{
                  frame: ({ currentFrame }) => {
                    console.log("currentFrame", currentFrame);
                  },
                }}
                // onStateChange={(playerState) => {
                //   console.log(playerState);
                // }}
                // onEvent={(playerEvent) => {
                //   console.log(playerEvent);
                // }}
              />
              {/*<Lottie*/}
              {/*  src={"https://assets5.lottiefiles.com/private_files/lf30_3ezlslmp.json"}*/}
              {/*  // src={source}*/}
              {/*  // src={"https://assets4.lottiefiles.com/packages/lf20_hslwihoj.json"}*/}
              {/*  // src={src}*/}
              {/*  initialValues={*/}
              {/*    {*/}
              {/*      // loop,*/}
              {/*      // autoplay,*/}
              {/*    }*/}
              {/*  }*/}
              {/*  enableReinitialize={true}*/}
              {/*  // controls={[PlayerControlsElement.Play, PlayerControlsElement.ProgressBar, PlayerControlsElement.Loop]}*/}
              {/*  controls*/}
              {/*  // onStateChange={(playerState) => {*/}
              {/*  //   console.log(playerState);*/}
              {/*  // }}*/}
              {/*  // onEvent={(playerEvent) => {*/}
              {/*  //   console.log(playerEvent);*/}
              {/*  // }}*/}
              {/*/>*/}
            </>
          )}
        </>
      )}
    </>
  );
};

export default FullLottieTest;
