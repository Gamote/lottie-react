/**
 * Gives the test environment enough of a canvas for lottie-web to load.
 *
 * Neither happy-dom nor jsdom implements the canvas API, so `getContext`
 * returns `null`. Every lottie-web build creates a canvas and writes to its 2D
 * context while its module body is still being evaluated, so importing any of
 * them throws before a test body can run. One working `fillRect` is the whole
 * requirement.
 *
 * Does nothing where there is no DOM, which is how the server lane runs. The
 * engine does not evaluate its own body there either, because it checks for
 * `document` first, so there is nothing to stub and nothing that could break.
 *
 * Call this before lottie-web is imported. The suite's setup file does it for
 * every test, which is what lets a test reach the engine through a plain static
 * import.
 */
export function installCanvasStub(): void {
  if (typeof HTMLCanvasElement === "undefined") {
    return;
  }

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: (): Pick<CanvasRenderingContext2D, "fillRect"> => ({
      fillRect: () => undefined,
    }),
  });
}
