import Lottie from "lottie-react/build"; // TODO: find a way to remove 'build'
import { AnimationItem } from "lottie-web";
import React, { CSSProperties, useRef, useState } from "react";
import { LottieRefCurrentProps } from "../../../src";
import groovyWalkAnimation from "./groovyWalk.json";

const toggleIndicator = (state: boolean) => (state ? "☑" : "☒");
type DataSource = "local" | "upload" | "remote";

const FullExample = () => {
  const [dataSource, setDataSource] = useState<DataSource>("remote");
  const [localData] = useState(groovyWalkAnimation);
  const [uploadData, setUploadData] = useState<any>(undefined);
  const [remoteData, setRemoteData] = useState<string | undefined>(
    "https://assets2.lottiefiles.com/private_files/lf30_e9pt4vym.json",
    // "https://assets2.lottiefiles.com/packages/lf20_bdkfpL.json",
  );

  const ref = useRef<LottieRefCurrentProps | null>(null);
  const lottieRef = useRef<AnimationItem | null>(null);
  const [loop, setLoop] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [initialSegment, setInitialSegment] = useState<[number, number]>();

  const style: CSSProperties = {
    borderWidth: 10,
    borderColor: "rgb(245, 245, 245)",
    borderStyle: "solid",
    borderRadius: 10,
    height: 200,
  };

  const determineDataBySourceType = () => {
    switch (dataSource) {
      case "local":
        return localData;
      case "upload":
        return uploadData;
      case "remote":
        return remoteData;
      default:
        throw new Error("No valid data found for source type");
    }
  };

  const dataSourceTypeSelector = () => {
    switch (dataSource) {
      case "local":
        return (
          <div>
            A local .json file is used for animation
            <textarea disabled value={JSON.stringify(localData)} />
          </div>
        );
      case "upload":
        return (
          <div>
            Upload your own .json file
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : new Blob();
                const fileReader = new FileReader();

                fileReader.onloadend = () => {
                  setUploadData(JSON.parse(fileReader.result as string));
                };

                fileReader.readAsText(file);
              }}
            />
            <textarea disabled value={JSON.stringify(uploadData)} />
          </div>
        );
      case "remote":
        return (
          <div>
            Use a remote link
            <input
              type="text"
              value={remoteData}
              onChange={(e) => setRemoteData(e.target.value)}
            />
          </div>
        );
      default:
        throw new Error("No valid data source");
    }
  };

  const animation = (
    <Lottie
      ref={ref}
      lottieRef={lottieRef}
      data={determineDataBySourceType()}
      loop={loop}
      autoplay={autoplay}
      initialSegment={initialSegment}
      // renderer="html" // TODO: test
      // renderer="canvas" // TODO: test
      renderer="svg"
      containerProps={{
        style,
      }}
      // TODO: finish this
      onEvent={(eventName) => {
        switch (eventName) {
          case "load":
            return console.log("Lottie listener: onDataReady called", loop);
          default:
            return console.log(
              `Lottie listener: Unrecognised event ${eventName}`,
            );
        }
      }}
      onStateChange={(stateName) => {
        console.log(`Lottie state: ${stateName}`);
      }}
      // interactivity={{
      //   mode: "scroll",
      //   actions: [
      //     {
      //       visibility: [0, 0.2],
      //       type: "stop",
      //       frames: [100],
      //     },
      //     {
      //       visibility: [0.2, 0.45],
      //       type: "seek",
      //       frames: [0, 100],
      //     },
      //     {
      //       visibility: [0.45, 1.0],
      //       type: "loop",
      //       frames: [100, 200],
      //     },
      //   ],
      // }}
    />
  );

  // setTimeout(() => {
  //   // eslint-disable-next-line no-console
  //   console.log("-->", ref.current?.pause());
  //   console.log("==>", lottieRef.current?.play());
  // }, 3000);

  return (
    <div>
      {animation}

      <h3>Data source</h3>
      <div>
        <select
          defaultValue={dataSource}
          onChange={(e) => {
            setDataSource(e.target.value as DataSource);
          }}
        >
          <option value="local">Local .json</option>
          <option value="upload">Upload .json</option>
          <option value="remote">Remote .json</option>
        </select>
        {dataSourceTypeSelector()}
      </div>
      <h3>Controls</h3>
      <div>
        <button type="button" onClick={() => setLoop(!loop)}>
          {toggleIndicator(loop)} Loop
        </button>
      </div>
      <div>
        <button type="button" onClick={() => setAutoplay(!autoplay)}>
          {toggleIndicator(autoplay)} Autoplay
        </button>
      </div>
      <div>
        {toggleIndicator(!!initialSegment)} Initial segments
        {!initialSegment ? (
          <button type="button" onClick={() => setInitialSegment([1, 50])}>
            Set
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setInitialSegment(undefined)}>
              Reset
            </button>
            <button type="button" onClick={() => setInitialSegment(undefined)}>
              Update
            </button>
          </>
        )}
      </div>
      <div>
        <button type="button" onClick={() => ref.current?.play()}>
          Play
        </button>
      </div>
      <div>
        <button type="button" onClick={() => ref.current?.pause()}>
          Pause
        </button>
      </div>
      <div>
        <button type="button" onClick={() => ref.current?.stop()}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default FullExample;
