import { act, cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { lottieDisplayClass } from "./LottieDisplay.js";
import { LottieLight } from "./LottieLight.js";
import { LottieSvg } from "./LottieSvg.js";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 123,
  h: 45,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

/*
 * One shape layer whose opacity the file sets to 100 and an expression sets to
 * 50. Which of the two is drawn is what tells a build that carries the
 * expression engine from one that does not.
 */
const EXPRESSION_ANIMATION = {
  ...ANIMATION,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "probe",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, x: "var $bm_rt;\n$bm_rt = 50;" },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [0, 0, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [],
      ip: 0,
      op: 30,
      st: 0,
      bm: 0,
    },
  ],
};

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  vi.restoreAllMocks();
});

function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

it("draws an animation with the svg build of the engine", () => {
  render(<LottieSvg src={ANIMATION} className="mine" />);
  flushLoad();

  const display = document.querySelector(`.${lottieDisplayClass}`);
  expect(display?.getAttribute("class")).toBe(`${lottieDisplayClass} mine`);
  /* Derived from the animation handed in, so no stand-in element satisfies it. */
  expect(display?.firstElementChild?.getAttribute("viewBox")).toBe(
    "0 0 123 45",
  );
});

/*
 * The svg build ships the full build's declarations, so its own types claim
 * renderers it does not contain and asking for one throws at runtime.
 * `types.test.ts` pins that throw against the real engine; this is the half
 * that stops anyone reaching it.
 */
it("refuses the renderers it does not contain, at compile time", () => {
  render(
    <>
      <LottieSvg src={ANIMATION} renderer="svg" />
      <LottieSvg
        src={ANIMATION}
        // @ts-expect-error
        renderer="canvas"
      />
      <LottieSvg
        src={ANIMATION}
        // @ts-expect-error
        renderer="html"
      />
    </>,
  );
  flushLoad();

  expect(document.querySelectorAll(`.${lottieDisplayClass}`)).toHaveLength(3);
});

/*
 * The reason this pair exists beside the light one. Both draw svg only; the
 * svg build alone evaluates expressions, and the light build draws the file's
 * static value instead. Read off the DOM the engine writes, so nothing internal
 * to either build is consulted.
 */
it("evaluates expressions, which is what tells it from the light build", () => {
  render(
    <>
      <LottieSvg src={EXPRESSION_ANIMATION} data-engine="svg" />
      <LottieLight src={EXPRESSION_ANIMATION} data-engine="light" />
    </>,
  );
  flushLoad();

  const opacity = (engine: string) =>
    document
      .querySelector(`[data-engine="${engine}"] g[opacity]`)
      ?.getAttribute("opacity");

  expect(opacity("svg")).toBe("0.5");
  expect(opacity("light")).toBe("1");
});
