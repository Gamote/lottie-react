import React, { useRef, useEffect } from "react";
import useLottie from "../../../src/hooks/useLottie";
import groovyWalkAnimation from "../../assets/groovyWalk.json";

const style = {
	height: 300,
	border: 3,
	borderStyle: "solid",
	borderRadius: 7,
};

const viewport = [0, 1];

const options = {
	animationData: groovyWalkAnimation,
	loop: false,
	autoplay: false,
};

function getContainerVisibility(container) {
	const { top, height } = container.getBoundingClientRect();

	const current = window.innerHeight - top;
	const max = window.innerHeight + height;
	return current / max;
}

const UseLottieWithInteractivity = () => {
	const { View, getDuration, goToAndStop } = useLottie(options, style);
	const containerRef = useRef();

	useEffect(() => {
		if (containerRef.current) {
			const totalFrames = getDuration(true);
			const container = containerRef.current;

			const scrollHandler = () => {
				const currentPercent = getContainerVisibility(container);

				const isInView =
					currentPercent >= viewport[0] &&
					currentPercent <= viewport[1];

				if (isInView) {
					goToAndStop(
						Math.ceil(
							((currentPercent - viewport[0]) /
								(viewport[1] - viewport[0])) *
								totalFrames,
						),
						true,
					);
				}
			};

			document.addEventListener("scroll", scrollHandler);

			return () => {
				document.removeEventListener("scroll", scrollHandler);
			};
		}

		return () => {};
	}, [goToAndStop, containerRef.current]);

	return <div ref={containerRef}>{View}</div>;
};

export default UseLottieWithInteractivity;
