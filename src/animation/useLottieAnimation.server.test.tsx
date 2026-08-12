/*
 * Runs with no DOM at all, which is the only way to prove the hook is safe on a
 * server rather than to assert it. Anything that reaches for `document` or for
 * the engine during render fails here and cannot fail anywhere else in the
 * suite, because every other file has happy-dom underneath it.
 */
// @vitest-environment node
import lottie from "lottie-web";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { LottieState } from "./types.js";
import { useLottie } from "./useLottie.js";
import { useLottieAnimation } from "./useLottieAnimation.js";

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

afterEach(() => {
  vi.restoreAllMocks();
});

it("is running with no DOM, so the rest of this file means something", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});

/*
 * lottie-web wraps its entire module body in a check for `document` and
 * `navigator`, so on a server the factory never runs and the default export is
 * an empty object. That is why importing it from a module a server will load is
 * safe, and why nothing may call it outside an effect.
 */
it("imports the engine without evaluating it", () => {
  expect(lottie).toBeTypeOf("object");
  expect(lottie.loadAnimation).toBeUndefined();
});

it("renders without touching the DOM or the engine", () => {
  function Probe() {
    const animation = useLottie({ src: ANIMATION, autoplay: true });
    return <div ref={animation.setDisplayRef} data-state={animation.state} />;
  }

  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

  const html = renderToString(<Probe />);

  expect(html).toContain(`data-state="${LottieState.loading}"`);
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

it("reports no animation and the loading state on the server", () => {
  let state: LottieState | undefined;
  let item: unknown;

  function Probe() {
    const animation = useLottieAnimation(lottie, { src: ANIMATION });
    state = animation.state;
    item = animation.animationItem;
    return <div ref={animation.setDisplayRef} />;
  }

  renderToString(<Probe />);

  expect(state).toBe(LottieState.loading);
  expect(item).toBeNull();
});

it("renders a source it could never load without complaining during render", () => {
  function Probe() {
    const animation = useLottieAnimation(lottie, { src: "" });
    return <div ref={animation.setDisplayRef} data-state={animation.state} />;
  }

  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  const html = renderToString(<Probe />);

  /*
   * The failure is only discovered in an effect, which a server never runs, so
   * the markup is the loading state and nothing is written to the console. This
   * is the shape of the defect that made an earlier version of this library
   * warn on every server render with no way to silence it.
   */
  expect(html).toContain(`data-state="${LottieState.loading}"`);
  expect(warn).not.toHaveBeenCalled();
});
