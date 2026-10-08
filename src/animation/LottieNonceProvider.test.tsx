/*
 * React inserts each stylesheet once per document and never touches it again,
 * so the nonce a sheet carries is settled by the first render that inserts it.
 * The first test here therefore has to be the first thing in its document to
 * render the library's sheets, and anything added above it disarms it silently.
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LottieControls } from "../controls/LottieControls.js";
import { reactMajor } from "../test/reactMajor.js";
import { Lottie } from "./Lottie.js";
import { LottieDisplay } from "./LottieDisplay.js";
import { LottieNonceProvider } from "./LottieNonceProvider.js";
import { renderStyledElement } from "./renderStyledElement.js";
import { stylePrecedence } from "./stylePrecedence.js";

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

afterEach(cleanup);

it.skipIf(reactMajor < 19)("puts the nonce on every sheet it hoists", () => {
  render(
    <LottieNonceProvider nonce={NONCE}>
      <Lottie src={ANIMATION}>
        <LottieDisplay />
        <LottieControls />
      </Lottie>
    </LottieNonceProvider>,
  );

  const sheets = [
    ...document.head.querySelectorAll(
      `style[data-precedence="${stylePrecedence}"]`,
    ),
  ];
  expect(
    sheets.map((sheet) => [
      sheet.getAttribute("data-href"),
      sheet.getAttribute("nonce"),
    ]),
  ).toEqual([
    ["lottie-display", NONCE],
    ["lottie-controls", NONCE],
    ["lottie-root", NONCE],
  ]);
});

/*
 * React 18 has no hoisting, so each sheet renders in place, and the nonce has
 * to reach every copy. `pnpm check:react18` is the lane that runs this.
 */
it.skipIf(reactMajor >= 19)("puts the nonce on every sheet in place", () => {
  const view = render(
    <LottieNonceProvider nonce={NONCE}>
      <Lottie src={ANIMATION}>
        <LottieDisplay />
        <LottieControls />
      </Lottie>
    </LottieNonceProvider>,
  );

  const nonces = [...view.container.querySelectorAll("style[href]")].map(
    (sheet) => sheet.getAttribute("nonce"),
  );
  expect(nonces).toEqual([NONCE, NONCE, NONCE]);
});

it("leaves the attribute off when no nonce is set", () => {
  const view = render(
    <div>
      {renderStyledElement({
        tag: "div",
        styleClass: "probe-no-nonce",
        styles: ":where(.probe-no-nonce){padding:7px}",
        attributes: {},
      })}
    </div>,
  );

  const sheet =
    document.head.querySelector('style[data-href="probe-no-nonce"]') ??
    view.container.querySelector('style[href="probe-no-nonce"]');
  expect(sheet).not.toBeNull();
  expect(sheet?.hasAttribute("nonce")).toBe(false);
});
