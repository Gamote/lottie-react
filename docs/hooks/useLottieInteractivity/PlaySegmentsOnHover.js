import useLottie from "../../../src/hooks/useLottie";
import useLottieInteractivity from "../../../src/hooks/useLottieInteractivity";
import robotAnimation from "../../assets/robotAnimation.json";

const style = {
  height: 300,
  border: 3,
  borderStyle: "solid",
  borderRadius: 7,
};

const options = {
  animationData: robotAnimation,
};

const PlaySegmentsOnHover = () => {
  const lottieObj = useLottie(options, style);
  const Animation = useLottieInteractivity({
    lottieObj,
    mode: "cursor",
    actions: [
      {
        position: { x: [0, 1], y: [0, 1] },
        type: "loop",
        frames: [45, 60],
      },
      {
        position: { x: -1, y: -1 },
        type: "stop",
        frames: [45],
      },
    ],
  });

  return Animation;
};

export default PlaySegmentsOnHover;
