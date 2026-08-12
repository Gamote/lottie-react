/**
 * What the indicator does for someone who has asked their machine for less
 * motion, which is a whole-environment setting and therefore a whole file.
 *
 * The preference is configured per test file and cannot be changed inside one,
 * so the comparison lives across two: the 0.8s assertion in
 * `LottieLoading.test.tsx` is this file's control, and deleting the rule this
 * file covers turns this red while leaving that green.
 *
 * @vitest-environment-options { "settings": { "device": { "prefersReducedMotion": "reduce" } } }
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { Lottie } from "../animation/Lottie.js";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { LottieLoading, lottieLoadingClass } from "./LottieLoading.js";

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

it("is running with the preference on, so the rest of this file means something", () => {
  expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(
    true,
  );
});

it("slows the indicator rather than stopping it", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );

  const spinner = document.querySelector(
    `.${lottieLoadingClass} > .lottie-spinner`,
  );
  if (spinner === null) {
    throw new Error("no indicator was rendered");
  }

  const computed = getComputedStyle(spinner);
  expect(computed.animationDuration).toBe("1.6s");
  /*
   * Still turning, and that is the decision rather than an oversight. The
   * preference asks for less motion, and an indicator that has stopped no
   * longer distinguishes a page that is working from one that has frozen.
   */
  expect(computed.animationName).toBe("lottie-spin");
  expect(computed.animationIterationCount).toBe("infinite");
});
