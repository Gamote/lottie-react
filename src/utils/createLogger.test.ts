import { afterEach, expect, it, vi } from "vitest";
import { createLogger } from "./createLogger.js";

afterEach(() => {
  vi.restoreAllMocks();
});

it("says nothing at all unless debugging was asked for", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const logger = createLogger(false);

  logger.log("loading");

  expect(log).not.toHaveBeenCalled();
});

it("prefixes what it writes, so a console with several libraries in it is readable", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const logger = createLogger(true);

  logger.log("loading");

  expect(log).toHaveBeenCalledExactlyOnceWith("[lottie-react] loading");
});

it("passes anything after the message through untouched", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const logger = createLogger(true);
  const config = { renderer: "svg", autoplay: true };

  logger.log("loading the animation", config);

  expect(log).toHaveBeenCalledExactlyOnceWith(
    "[lottie-react] loading the animation",
    config,
  );
});
