import { act, render } from "@testing-library/react";
import { expect, it } from "vitest";
import { LottieRenderer, LottieState } from "./types.js";
import { useLottieSvg } from "./useLottieSvg.js";

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

it("loads with the svg build, which draws only svg", async () => {
  let state: LottieState | undefined;
  let element: Element | null | undefined;

  function Probe() {
    const lottie = useLottieSvg({
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
 * runs. The svg build genuinely has no canvas or html renderer and throws when
 * asked for one, while shipping the full build's declarations, which say it
 * does. Refusing them here is what turns that runtime throw into a compile
 * error. The options type is read off the hook rather than written again, so
 * it cannot drift from the signature it is meant to be describing.
 */
type SvgOptions = Parameters<typeof useLottieSvg>[0];

const _svgIsAccepted: SvgOptions = {
  src: ANIMATION,
  renderer: LottieRenderer.svg,
};

const _canvasIsRefused: SvgOptions = {
  src: ANIMATION,
  // @ts-expect-error the svg build has no canvas renderer
  renderer: LottieRenderer.canvas,
};

const _htmlIsRefused: SvgOptions = {
  src: ANIMATION,
  // @ts-expect-error the svg build has no html renderer
  renderer: LottieRenderer.html,
};
