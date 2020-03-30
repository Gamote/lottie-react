import React from "react";
import useLottie from "../../src/hooks/useLottie";
import gemAnimation from "./assets/gem.json";

const style = {
	height: 300,
};

const BasicUsage = () => {
	const options = {
		animationData: gemAnimation,
		renderer: "svg",
		loop: true,
		autoplay: true,
	};

	const { View } = useLottie(options, style);

	return <>{View}</>;
};

export default BasicUsage;
