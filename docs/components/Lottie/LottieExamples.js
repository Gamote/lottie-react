import React, { useEffect, useRef, useState } from "react";
import Lottie from "../../../src/components/Lottie";
import groovyWalkAnimation from "../../assets/groovyWalk.json";
// import likeButtonAnimation from "../../assets/likeButton.json";

const styles = {
  animation: {
    height: 300,
    border: 3,
    borderStyle: "solid",
    borderRadius: 7,
  },
};

const LottieExamples = () => {
  const ref = useRef();
  const [animationData, setAnimationData] = useState(groovyWalkAnimation);
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [initialSegment, setInitialSegment] = useState(null);
  const [style, setStyle] = useState(styles.animation);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Test the unmount hooks
    // setTimeout(() => {
    // 	setShow(false);
    // }, 4000);
    //
    // setTimeout(() => {
    // 	setShow(true);
    // }, 8000);
    //
    // // Test ref
    // setTimeout(() => {
    // 	console.log("Info: ref current value", ref.current);
    // 	ref.current.pause();
    // }, 4000);
    //
    // Test animationData
    // setTimeout(() => {
    // 	console.log("Info: animationData changed in", likeButtonAnimation);
    // 	setAnimationData(likeButtonAnimation);
    // }, 2000);
    //
    // Test loop
    // setTimeout(() => {
    // 	console.log("Info: loop changed in", false);
    // 	setLoop(false);
    // }, 2000);
    // setTimeout(() => {
    // 	console.log("Info: loop changed in", true);
    // 	setLoop(true);
    // }, 20000);
    // setTimeout(() => {
    // 	console.log("Info: loop changed in", 3);
    // 	setLoop(6);
    // }, 3000);
    //
    // Test autoplay
    // setTimeout(() => {
    // 	console.log("Info: autoplay changed in", true);
    // 	setAutoplay(true);
    // }, 4000);
    //
    // Test initialSegment
    // setTimeout(() => {
    // 	console.log("Info: initialSegment changed in", [0, 10]);
    // 	setInitialSegment([0, 10]);
    // }, 4000);
    //
    // Test styles
    // setTimeout(() => {
    // 	console.log("Info: styles changed in", {
    // 		...styles.animation,
    // 		backgroundColor: "blue",
    // 	});
    // 	setStyle({
    // 		...styles.animation,
    // 		backgroundColor: "blue",
    // 	});
    // }, 4000);
  }, []);

  const animation = (
    <Lottie
      lottieRef={ref}
      data={animationData}
      loop={loop}
      autoplay={autoplay}
      initialSegment={initialSegment}
      // onComplete={() => {
      // 	console.log("Info: onComplete called");
      // }}
      // onLoopComplete={() => {
      // 	console.log("Info: onLoopComplete called");
      // }}
      // onEnterFrame={() => {
      // 	console.log("Info: onEnterFrame called");
      // }}
      // onSegmentStart={() => {
      // 	console.log("Info: onSegmentStart called");
      // }}
      // onConfigReady={() => {
      // 	console.log("Info: onConfigReady called");
      // }}
      // onDataReady={() => {
      // 	console.log("Info: onDataReady called");
      // }}
      // onDataFailed={() => {
      // 	console.log("Info: onDataFailed called");
      // }}
      // onLoadedImages={() => {
      // 	console.log("Info: onLoadedImages called");
      // }}
      // onDOMLoaded={() => {
      // 	console.log("Info: onDOMLoaded called");
      // }}
      // onDestroy={() => {
      // 	console.log("Info: onDestroy called");
      // }}
      style={style}
    />
  );

  return show ? animation : "Animation is hidden";
};

export default LottieExamples;
