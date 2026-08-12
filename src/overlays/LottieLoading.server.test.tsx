/*
 * Runs with no DOM at all, which is the only way to prove the component is safe
 * on a server rather than to assert it. Anything reaching for `document` or for
 * the engine during render fails here and cannot fail anywhere else in the
 * suite, because every other file has happy-dom underneath it.
 */
// @vitest-environment node
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { stylePrecedence } from "../animation/stylePrecedence.js";
import { useLottie } from "../animation/useLottie.js";
import { reactMajor } from "../test/reactMajor.js";
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

afterEach(() => {
  vi.restoreAllMocks();
});

it("is running with no DOM, so the rest of this file means something", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});

it("renders into the markup, because a server render is always still loading", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <>
        <LottieDisplay lottie={lottie} />
        <LottieLoading lottie={lottie} />
      </>
    );
  }

  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

  const html = renderToString(<Probe />);

  /*
   * Nothing loads on a server, so the overlay is in the markup the browser
   * receives and goes as soon as the animation arrives. That is the point of it
   * being state-driven rather than an effect away.
   */
  expect(html).toContain(`class="${lottieLoadingClass}"`);
  expect(html).toContain('role="status"');
  expect(html).toContain("lottie-spinner");
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

it.skipIf(reactMajor < 19)(
  "names the stylesheet with the class, once per render path",
  () => {
    function Probe() {
      const first = useLottie({ src: ANIMATION });
      const second = useLottie({ src: ANIMATION });
      return (
        <>
          <LottieLoading lottie={first} />
          <LottieLoading lottie={second} />
        </>
      );
    }

    const html = renderToString(<Probe />);

    /*
     * The token set rather than the element count. This path merges every sheet
     * sharing a precedence into one element carrying a space-separated list, so a
     * count would be measuring React's merging rather than our deduplication.
     */
    const tokens = [...html.matchAll(/data-href="([^"]*)"/g)].flatMap((match) =>
      match[1].split(" "),
    );
    expect(tokens).toEqual([lottieLoadingClass]);
    expect(html).toContain(`data-precedence="${stylePrecedence}"`);
  },
);

it("carries the wait a prop asked for into the markup", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieLoading lottie={lottie} showAfter={0} />;
  }

  expect(renderToString(<Probe />)).toContain("--lottie-loading-delay:0ms");
});
