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
  animData: robotAnimation,
};

const CursorDiagonalSync = () => {
  const lottieObject = useLottie(options);
  const Animation = useLottieInteractivity({
    lottieObject,
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
