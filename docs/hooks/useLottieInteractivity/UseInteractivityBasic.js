import useLottie from "../../../src/hooks/useLottie";
import useLottieInteractivity from "../../../src/hooks/useLottieInteractivity";
import likeButton from "../../assets/likeButton.json";

const style = {
  height: 300,
  border: 3,
  borderStyle: "solid",
  borderRadius: 7,
};

const options = {
  animationData: likeButton,
};

const UseInteractivityBasic = () => {
  const lottieObj = useLottie(options, style);
  const Animation = useLottieInteractivity({
    mode: "scroll",
    lottieObj,
    actions: [
      {
        visibility: [0.4, 0.9],
        type: "seek",
        frames: [0, 38],
      },
    ],
  });

  return Animation;
};

export default UseInteractivityBasic;
