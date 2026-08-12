import { act, render } from "@testing-library/react";
import { expect, it } from "vitest";
import { LottieRenderer, LottieState } from "./types.js";
import { useLottieLight } from "./useLottieLight.js";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 100,
  h: 100,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

async function flushLoad(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}

it("loads with the light build, which draws only svg", async () => {
  let state: LottieState | undefined;
  let element: Element | null | undefined;

  function Probe() {
    const lottie = useLottieLight({
      src: ANIMATION,
      renderer: LottieRenderer.svg,
    });
    state = lottie.state;
    element = lottie.animationItem?.renderer.svgElement ?? null;
    return <div ref={lottie.setDisplayRef} />;
  }

  render(<Probe />);
  await flushLoad();

  expect(state).toBe(LottieState.stopped);
  expect(element?.tagName).toBe("svg");
});

/*
 * Everything below is checked by `tsc` rather than by vitest, and none of it
 * runs. The light build genuinely has no canvas or html renderer and throws
 * when asked for one, while shipping the full build's declarations, which say
 * it does. Refusing them here is what turns that runtime throw into a compile
 * error. The options type is read off the hook rather than written again, so it
 * cannot drift from the signature it is meant to be describing.
 */
type LightOptions = Parameters<typeof useLottieLight>[0];

const _svgIsAccepted: LightOptions = {
  src: ANIMATION,
  renderer: LottieRenderer.svg,
};

const _canvasIsRefused: LightOptions = {
  src: ANIMATION,
  // @ts-expect-error the light build has no canvas renderer
  renderer: LottieRenderer.canvas,
};

const _htmlIsRefused: LightOptions = {
  src: ANIMATION,
  // @ts-expect-error the light build has no html renderer
  renderer: LottieRenderer.html,
};
