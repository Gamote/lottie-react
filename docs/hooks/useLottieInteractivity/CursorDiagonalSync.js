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
  data: robotAnimation,
};

const CursorDiagonalSync = () => {
  const lottieObj = useLottie(options, style);
  const Animation = useLottieInteractivity({
    lottieObj,
    mode: "cursor",
    actions: [
      {
        position: { x: [0, 1], y: [0, 1] },
        type: "seek",
        frames: [0, 180],
      },
    ],
  });

  return Animation;
};

export default CursorDiagonalSync;
