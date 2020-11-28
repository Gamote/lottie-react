import useLottie from "../../../src/hooks/useLottie";
import groovyWalkAnimation from "../../assets/groovyWalk.json";

const style = {
  height: 300,
  border: 3,
  borderStyle: "solid",
  borderRadius: 7,
};

const UseLottieExamples = () => {
  const options = {
    data: groovyWalkAnimation,
    loop: true,
    autoplay: true,
  };

  const Lottie = useLottie(options, style);

  // useEffect(() => {
  // 	setTimeout(() => {
  // 		// Lottie.play();
  // 		// Lottie.stop();
  // 		// Lottie.pause();
  // 		// Lottie.setSpeed(5);
  // 		// Lottie.goToAndStop(6150);
  // 		// Lottie.goToAndPlay(6000);
  // 		// Lottie.setDirection(-1);
  // 		// Lottie.playSegments([350, 500]);
  // 		// Lottie.playSegments([350, 500], true);
  // 		// Lottie.setSubframe(true);
  // 		// console.log('Duration:', Lottie.getDuration());
  // 		// Lottie.destroy();
  // 	}, 2000);
  // });

  return Lottie.View;
};

export default UseLottieExamples;
