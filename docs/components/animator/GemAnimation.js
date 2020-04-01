import React, { useEffect, useRef, useState } from "react";
import Animator from "../../../src/components/Animator";
import gemAnimation from "../../assets/gem.json";
// import likeButtonAnimation from "../../assets/likeButton.json";

const styles = {
	animation: {
		height: 300,
		border: 3,
		borderStyle: "solid",
		borderRadius: 7,
	},
};

const GemAnimation = () => {
	const ref = useRef({});
	const [animationData, setAnimationData] = useState(gemAnimation);
	const [loop, setLoop] = useState(true);
	const [autoplay, setAutoplay] = useState(true);
	const [initialSegment, setInitialSegment] = useState(null);
	const [style, setStyle] = useState(styles.animation);

	useEffect(() => {
		// // Test ref
		// setTimeout(() => {
		// 	console.log("Info: ref current value", ref.current);
		// 	ref.current.pause();
		// }, 4000);
		//
		// Test animationData
		// setTimeout(() => {
		// 	console.log("Info: animationData changed in", likeButtonAnimation);
		// 	setAnimationData(likeButtonAnimation);
		// }, 2000);
		//
		// Test loop
		// setTimeout(() => {
		// 	console.log("Info: loop changed in", false);
		// 	setLoop(false);
		// }, 2000);
		// setTimeout(() => {
		// 	console.log("Info: loop changed in", true);
		// 	setLoop(true);
		// }, 20000);
		// setTimeout(() => {
		// 	console.log("Info: loop changed in", 3);
		// 	setLoop(6);
		// }, 3000);
		//
		// Test autoplay
		// setTimeout(() => {
		// 	console.log("Info: autoplay changed in", true);
		// 	setAutoplay(true);
		// }, 4000);
		//
		// Test initialSegment
		// setTimeout(() => {
		// 	console.log("Info: initialSegment changed in", [0, 10]);
		// 	setInitialSegment([0, 10]);
		// }, 4000);
		//
		// Test styles
		// setTimeout(() => {
		// 	console.log("Info: styles changed in", {
		// 		...styles.animation,
		// 		backgroundColor: "blue",
		// 	});
		// 	setStyle({
		// 		...styles.animation,
		// 		backgroundColor: "blue",
		// 	});
		// }, 4000);
	}, []);

	return (
		<Animator
			ref={ref}
			animationData={animationData}
			loop={loop} // TODO: allow numbers
			autoplay={autoplay}
			initialSegment={initialSegment}
			style={style}
		/>
	);
};

export default GemAnimation;
