import React, { useEffect, useRef, useState } from "react";
import Lottie from "../../../src/components/Lottie";
import groovyWalkAnimation from "../../assets/groovyWalk.json";
import vac from "../../assets/35598-vacation.json";
import { useLottie } from "../../../src";
// import likeButtonAnimation from "../../assets/likeButton.json";

const styles = {
  animation: {
    height: 300,
    border: 3,
    borderStyle: "solid",
    borderRadius: 7,
  },
};

const LottieTest = () => {
  const ref = useRef();
  const [data, setData] = useState(groovyWalkAnimation);
  const [path, setPath] = useState(
    "https://assets4.lottiefiles.com/packages/lf20_ovhnyvxu.json",
  );
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [initialSegment, setInitialSegment] = useState([1, 250]);
  const [style, setStyle] = useState(styles.animation);
  const [show, setShow] = useState(true);
  const [onComp, setOnComp] = useState("DAA");

  // const l = useLottie({
  //   data: data,
  //   loop,
  //   autoplay,
  //   style,
  //   onLoopComplete: (event) => {
  //     console.log("Loop completed", event);
  //   },
  // });
  //
  // return l.View;

  setTimeout(() => {
    setOnComp("NUU");
  }, 10000);

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
    <>
      <Lottie
        data={path}
        loop={loop}
        autoplay={autoplay}
        initialSegment={initialSegment}
        listeners={{
          // Works
          onComplete: () => {
            console.log("Info: onComplete called");
          },
          // Works
          onLoopComplete: () => {
            console.log("Info: onLoopComplete called");
          },
          // Works
          onEnterFrame: () => {
            // console.log("Info: onEnterFrame called");
          },
          // Works
          onSegmentStart: () => {
            console.log("Info: onSegmentStart called");
          },
          onConfigReady: () => {
            console.log("Info: onConfigReady called");
          },
          onDataReady: () => {
            console.log("Info: onDataReady called");
          },
          // Works
          onDataFailed: () => {
            console.log("Info: onDataFailed called");
          },
          onLoadedImages: () => {
            console.log("Info: onLoadedImages called");
          },
          // Works
          onDOMLoaded: () => {
            console.log("Info: onDOMLoaded called");
          },
          onDestroy: () => {
            console.log("Info: onDestroy called");
          },
        }}
        lottieRef={ref}
        containerProps={{
          style,
        }}
      />
      <input type="checkbox" checked={loop} onChange={() => setLoop(!loop)} />{" "}
      Loop
      <input
        type="checkbox"
        checked={autoplay}
        onChange={() => setAutoplay(!autoplay)}
      />{" "}
      Autoplay
      <button type="button" onClick={() => setInitialSegment([1, 250])}>
        Segments 1-250
      </button>
      <button type="button" onClick={() => setInitialSegment([1, 100])}>
        Segments 1-100
      </button>
      <button type="button" onClick={() => setInitialSegment([])}>
        Segments []
      </button>
      <button type="button" onClick={() => setInitialSegment(null)}>
        Segments null
      </button>
    </>
  );

  return show ? animation : "Animation is hidden";
};

export default LottieTest;
