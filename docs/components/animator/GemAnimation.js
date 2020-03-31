import React from "react";
import Animator from "../../../src/components/Animator";
import gemAnimation from "../../assets/gem.json";

const style = {
	height: 300,
};

const GemAnimation = () => {
	const options = {
		animationData: gemAnimation,
		loop: true,
		autoplay: true,
	};

	return (
		<>
			<Animator options={options} style={style} />
		</>
	);
};

export default GemAnimation;
