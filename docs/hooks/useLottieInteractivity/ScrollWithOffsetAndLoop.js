import useLottie from "../../../src/hooks/useLottie";
import useLottieInteractivity from "../../../src/hooks/useLottieInteractivity";
import robotAnimation from "../../assets/robotAnimation.json";

const style = {
  height: 450,
};

const options = {
  data: robotAnimation,
  loop: true,
};

const ScrollWithOffsetAndLoop = () => {
  const lottieObject = useLottie(options, style);
  const Animation = useLottieInteractivity({
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
  });

  return Animation;
};
// max 180

export default ScrollWithOffsetAndLoop;
