/**
 * What autoplay does for someone who has asked their machine for less motion,
 * which is a whole-environment setting and therefore a whole file.
 *
 * The preference is configured per test file and cannot be changed inside one,
 * so the comparison lives across two: the "autoplay starts playing" assertions
 * in `useLottieAnimation.test.tsx` are this file's control, and deleting the
 * deferral turns this red while leaving those green.
 *
 * @vitest-environment-options { "settings": { "device": { "prefersReducedMotion": "reduce" } } }
 */
import { act, cleanup, render } from "@testing-library/react";
import lottie from "lottie-web";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { type LottieInstance, LottieState } from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
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

function setup(options: UseLottieOptions): { instance: LottieInstance } {
  let latest: LottieInstance | undefined;

  function Probe(props: UseLottieOptions) {
    const instance = useLottieAnimation(lottie, props);
    latest = instance;
    return <div ref={instance.setDisplayRef} />;
  }

  render(<Probe {...options} />);

  return {
    get instance() {
      if (latest === undefined) {
        throw new Error("the probe never rendered");
      }
      return latest;
    },
  };
}

it("is running with the preference on, so the rest of this file means something", () => {
  expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(
    true,
  );
});

it("loads an autoplaying animation without starting it", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION, autoplay: true, loop: true });
  act(() => {
    vi.advanceTimersByTime(0);
  });

  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("reduced motion");
});

it("still plays when someone asks it to", () => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION, autoplay: true });
  act(() => {
    vi.advanceTimersByTime(0);
  });

  act(() => {
    harness.instance.play();
  });

  expect(harness.instance.state).toBe(LottieState.playing);
});

it("does not warn at all when autoplay was never asked for", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  setup({ src: ANIMATION });
  act(() => {
    vi.advanceTimersByTime(0);
  });

  expect(warn).not.toHaveBeenCalled();
});
