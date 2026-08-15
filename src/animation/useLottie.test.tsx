import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LottieRenderer, LottieState } from "./types.js";
import { useLottie } from "./useLottie.js";

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

/** lottie-web announces a finished load on a macrotask rather than inline. */
/**
 * One null layer whose opacity carries an expression, written the way the
 * exporter writes it. `value` is the property's own value, so a build that
 * evaluates it draws exactly what a build that ignores it draws.
 */
const WITH_EXPRESSION = {
  ...ANIMATION,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 3,
      nm: "null",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, x: "var $bm_rt;\n$bm_rt = value;" },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      ip: 0,
      op: 30,
      st: 0,
      bm: 0,
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

async function flushLoad(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}

/*
 * The state is not asserted for every renderer, because the canvas one cannot
 * finish building under happy-dom: the environment has no canvas, and the stub
 * that lets the engine load at all implements a single method. What each
 * renderer appends is the contract tier's subject, so the claim here is the
 * narrow one that matters for this hook, that the full build accepts all three.
 */
it.each([LottieRenderer.svg, LottieRenderer.canvas, LottieRenderer.html])(
  "accepts the %s renderer, which only the full build contains",
  async (renderer) => {
    let state: LottieState | undefined;
    let loaded = false;

    function Probe() {
      const lottie = useLottie({ src: ANIMATION, renderer });
      state = lottie.state;
      loaded = lottie.animationItem !== null;
      return <div ref={lottie.setDisplayRef} />;
    }

    render(<Probe />);
    await flushLoad();

    expect(state).not.toBe(LottieState.error);
    expect(loaded).toBe(true);
  },
);

it("defaults to the svg renderer when none is named", async () => {
  let element: Element | null | undefined;

  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    element = lottie.animationItem?.renderer.svgElement ?? null;
    return <div ref={lottie.setDisplayRef} />;
  }

  render(<Probe />);
  await flushLoad();

  expect(element?.tagName).toBe("svg");
});

it("stays quiet about expressions, which this build evaluates", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  let state: LottieState | undefined;

  function Probe() {
    const lottie = useLottie({ src: WITH_EXPRESSION });
    state = lottie.state;
    return <div ref={lottie.setDisplayRef} />;
  }

  render(<Probe />);
  await flushLoad();

  expect(state).toBe(LottieState.stopped);
  expect(warn).not.toHaveBeenCalled();
});
