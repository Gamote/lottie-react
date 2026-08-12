/*
 * Runs with no DOM at all, which is the only way to prove the component is safe
 * on a server rather than to assert it.
 *
 * This file asserts an absence, which is deliberate. A failure can only be
 * discovered by the load, the load only starts once an element is attached, and
 * a server attaches nothing and runs no effect. So the failure overlay cannot
 * appear in server markup however broken the source is, and the thing worth
 * pinning is that an unusable source still renders a page rather than throwing.
 */
// @vitest-environment node
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { useLottie } from "../animation/useLottie.js";
import { LottieError, lottieErrorClass } from "./LottieError.js";
import { LottieLoading, lottieLoadingClass } from "./LottieLoading.js";

afterEach(() => {
  vi.restoreAllMocks();
});

it("is running with no DOM, so the rest of this file means something", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});

it("renders the page as loading, even for a source that cannot work", () => {
  function Probe() {
    const lottie = useLottie({ src: "" });
    return (
      <>
        <LottieDisplay lottie={lottie} />
        <LottieLoading lottie={lottie} />
        <LottieError lottie={lottie} />
      </>
    );
  }

  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

  const html = renderToString(<Probe />);

  expect(html).toContain(lottieLoadingClass);
  expect(html).not.toContain(lottieErrorClass);
  /* The failure is the browser's to discover, and it must be silent here. */
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});
