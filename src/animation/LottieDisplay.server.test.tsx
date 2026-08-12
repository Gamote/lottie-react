/*
 * Runs with no DOM at all, which is the only way to prove the component is safe
 * on a server rather than to assert it. Anything reaching for `document` or for
 * the engine during render fails here and cannot fail anywhere else in the
 * suite, because every other file has happy-dom underneath it.
 */
// @vitest-environment node
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { reactMajor } from "../test/reactMajor.js";
import { LottieDisplay, lottieDisplayClass } from "./LottieDisplay.js";
import { LottieInstanceContext } from "./LottieInstanceContext.js";
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

afterEach(() => {
  vi.restoreAllMocks();
});

it("is running with no DOM, so the rest of this file means something", () => {
  expect(typeof document).toBe("undefined");
  expect(typeof window).toBe("undefined");
});

it.skipIf(reactMajor < 19)(
  "renders the element and its stylesheet, and complains about nothing",
  () => {
    function Probe() {
      const lottie = useLottie({ src: ANIMATION });
      return <LottieDisplay lottie={lottie} className="mine" />;
    }

    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const html = renderToString(<Probe />);

    expect(html).toContain(`class="${lottieDisplayClass} mine"`);
    expect(html).toContain(`data-precedence="${stylePrecedence}"`);
    expect(html).toContain(":where(.lottie-display)");
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  },
);

it.skipIf(reactMajor < 19)(
  "names the stylesheet with the class, once per render path",
  () => {
    function Probe() {
      const first = useLottie({ src: ANIMATION });
      const second = useLottie({ src: ANIMATION });
      return (
        <>
          <LottieDisplay lottie={first} />
          <LottieDisplay lottie={second} />
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
    expect(tokens).toEqual([lottieDisplayClass]);
  },
);

it("renders the tag `as` names without a browser", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} as="section" />;
  }

  expect(renderToString(<Probe />)).toContain("<section");
});

it("reaches the animation through the context on a server too", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <LottieInstanceContext.Provider value={lottie}>
        <LottieDisplay />
      </LottieInstanceContext.Provider>
    );
  }

  expect(renderToString(<Probe />)).toContain(`class="${lottieDisplayClass}"`);
});

it("draws nothing, because the engine is not there to draw it", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} />;
  }

  const html = renderToString(<Probe />);

  /* The markup arrives sized and empty, and fills in once the browser has it. */
  expect(html).toContain(`<div class="${lottieDisplayClass}"></div>`);
  expect(html).not.toContain("<svg");
});
