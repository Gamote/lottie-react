import { act, cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { lottieDisplayClass } from "./LottieDisplay.js";
import { LottieLight } from "./LottieLight.js";

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

it("draws an animation with the smaller copy of the engine", () => {
  render(<LottieLight src={ANIMATION} className="mine" />);
  flushLoad();

  const display = document.querySelector(`.${lottieDisplayClass}`);
  expect(display?.getAttribute("class")).toBe(`${lottieDisplayClass} mine`);
  /* Derived from the animation handed in, so no stand-in element satisfies it. */
  expect(display?.firstElementChild?.getAttribute("viewBox")).toBe(
    "0 0 123 45",
  );
});

/*
 * The whole difference between the two components. The light build ships the
 * full build's declarations, so its own types claim renderers it does not
 * contain and asking for one throws `RendererClass is not a constructor` at
 * runtime. `types.test.ts` pins that throw against the real engine; this is the
 * half that stops anyone reaching it.
 */
it("refuses the renderers it does not contain, at compile time", () => {
  render(
    <>
      <LottieLight src={ANIMATION} renderer="svg" />
      <LottieLight
        src={ANIMATION}
        // @ts-expect-error
        renderer="canvas"
      />
      <LottieLight
        src={ANIMATION}
        // @ts-expect-error
        renderer="html"
      />
    </>,
  );
  flushLoad();

  expect(document.querySelectorAll(`.${lottieDisplayClass}`)).toHaveLength(3);
});
