import useLottie from "../../../src/hooks/useLottie";
import useLottieInteractivity from "../../../src/hooks/useLottieInteractivity";
import likeButton from "../../assets/likeButton.json";

const style = {
  height: 300,
};

const options = {
  animationData: likeButton,
};

const ScrollWithOffset = () => {
  const lottieObj = useLottie(options, style);
  const Animation = useLottieInteractivity({
    lottieObj,
    mode: "scroll",
    actions: [
      {
        visibility: [0, 0.45],
        type: "stop",
        frames: [0],
      },
      {
        visibility: [0.45, 1],
        type: "seek",
        frames: [0, 38],
      },
    ],
  });

  return Animation;
};

export default ScrollWithOffset;
