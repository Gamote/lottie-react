import useLottie from "../../../src/hooks/useLottie";
import useLottieInteractivity from "../../../src/hooks/useLottieInteractivity";
import hamsterAnimation from "../../assets/hamster.json";

const style = {
  height: 300,
  border: 3,
  borderStyle: "solid",
  borderRadius: 7,
};

const options = {
  animData: hamsterAnimation,
};

const CursorHorizontalSync = () => {
  const lottieObject = useLottie(options);
  const Animation = useLottieInteractivity({
    lottieObject,
    mode: "cursor",
    actions: [
      {
        position: { x: [0, 1], y: [-1, 2] },
        type: "seek",
        frames: [0, 179],
      },
      {
        position: { x: -1, y: -1 },
        type: "stop",
        frames: [0],
      },
    ],
  });

  return Animation;
};

export default CursorHorizontalSync;
