/*
 * Runs with no DOM, where React writes hoisted sheets into the HTML itself and
 * keeps the rules of a sheet only when its nonce matches the style nonce the
 * render was given.
 */
// @vitest-environment node
import {
  type RenderToReadableStreamOptions,
  renderToReadableStream,
  renderToString,
} from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { reactMajor } from "../test/reactMajor.js";
import { LottieDisplay } from "./LottieDisplay.js";
import { LottieNonceProvider } from "./LottieNonceProvider.js";
import { stylePrecedence } from "./stylePrecedence.js";
import { useLottie } from "./useLottie.js";

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

const NONCE = "probe-nonce";

function Probe() {
  const lottie = useLottie({ src: ANIMATION });
  return <LottieDisplay lottie={lottie} />;
}

afterEach(() => {
  vi.restoreAllMocks();
});

it.skipIf(reactMajor < 19)(
  "keeps the rules under the render's style nonce, and complains about nothing",
  async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    /* TODO: drop the cast once @types/react-dom types the object form of
     `nonce`, which React's runtime and documentation already accept. */
    const options = {
      nonce: { style: NONCE },
    } as unknown as RenderToReadableStreamOptions;

    const stream = await renderToReadableStream(
      <LottieNonceProvider nonce={NONCE}>
        <Probe />
      </LottieNonceProvider>,
      options,
    );
    await stream.allReady;
    const html = await new Response(stream).text();

    expect(html).toContain(
      `<style nonce="${NONCE}" data-precedence="${stylePrecedence}"`,
    );
    expect(html).toContain(":where(.lottie-display)");
    expect(error).not.toHaveBeenCalled();
  },
);

it.skipIf(reactMajor >= 19)("writes the nonce on the sheet in place", () => {
  const html = renderToString(
    <LottieNonceProvider nonce={NONCE}>
      <Probe />
    </LottieNonceProvider>,
  );

  expect(html).toContain(`nonce="${NONCE}"`);
});
