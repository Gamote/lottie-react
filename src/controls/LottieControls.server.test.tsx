/*
 * Runs with no DOM at all, which is the only way to prove the bar is safe on a
 * server rather than to assert it.
 *
 * Fullscreen is the reason this file exists. Whether a browser can do it at all
 * is a question only a browser can answer, and the hook this replaces asked it
 * while rendering: a server render reached for `document`, found nothing, and
 * logged a warning from inside the render body. It fired on every render and on
 * every server render, could not be silenced, and told the person building the
 * page about a limitation of their user's browser.
 */
// @vitest-environment node
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { useLottie } from "../animation/useLottie.js";
import { LottieControls, lottieControlsClass } from "./LottieControls.js";
import { lottieFullscreenClass } from "./LottieFullscreenButton.js";
import { lottiePlayClass } from "./LottiePlayButton.js";

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

afterEach(() => {
  vi.restoreAllMocks();
});

function Probe() {
  const lottie = useLottie({ src: ANIMATION });
  return (
    <>
      <LottieDisplay lottie={lottie} />
      <LottieControls lottie={lottie} />
    </>
  );
}

it("is running with no DOM, so the rest of this file means something", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});

it("renders the bar on a server without saying anything to anyone", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

  const html = renderToString(<Probe />);

  expect(html).toContain(lottieControlsClass);
  expect(html).toContain(lottiePlayClass);
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

it("sends no fullscreen button, because a server cannot know whether one works", () => {
  const html = renderToString(<Probe />);

  /*
   * The markup a browser is handed therefore matches what React renders on its
   * first pass, and the button appears afterwards, once an effect has been able
   * to look. Deciding during render instead would put a button in the server's
   * markup that the client might not draw, which is a hydration mismatch rather
   * than a missing feature.
   */
  expect(html).not.toContain(lottieFullscreenClass);
});
