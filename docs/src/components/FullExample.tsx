import Lottie from "lottie-react/build"; // TODO: find a way to remove 'build'
import React, { CSSProperties, useRef, useState } from "react";
import groovyWalkAnimation from "./groovyWalk.json";

const toogleIndicator = (state: boolean) => (state ? "☑" : "☒");

const FullExample = () => {
  const lottieRef = useRef(null);
  const [data, setData] = useState(groovyWalkAnimation);
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [initialSegment, setInitialSegment] = useState(undefined);
  const [show, setShow] = useState(true);

  const style: CSSProperties = {
    borderWidth: 10,
    borderColor: "rgb(245, 245, 245)",
    borderStyle: "solid",
    borderRadius: 10,
    height: 200,
  };

  const animation = (
    <Lottie
      lottieRef={lottieRef}
      data={data}
      loop={loop}
      autoplay={autoplay}
      initialSegment={initialSegment}
      containerProps={{
        style,
      }}
    />
  );

  return (
    <div>
      {animation}

      <button type="button" onClick={() => setLoop(!loop)}>
        {toogleIndicator(loop)} Loop
      </button>

      <button type="button" onClick={() => setAutoplay(!autoplay)}>
        {toogleIndicator(autoplay)} Autoplay
      </button>
    </div>
  );
};

export default FullExample;
