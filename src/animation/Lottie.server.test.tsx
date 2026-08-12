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
import { Lottie } from "./Lottie.js";
import { LottieDisplay, lottieDisplayClass } from "./LottieDisplay.js";
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

const lottieRootClass = "lottie-root";

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
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const html = renderToString(
      <Lottie src={ANIMATION} className="mine" title="a tooltip" />,
    );

    expect(html).toContain(`class="${lottieDisplayClass} mine"`);
    expect(html).toContain('title="a tooltip"');
    expect(html).toContain(`data-precedence="${stylePrecedence}"`);
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  },
);

it("renders the box and its children when you place the animation", () => {
  const html = renderToString(
    <Lottie src={ANIMATION}>
      <p>a caption</p>
      <LottieDisplay />
    </Lottie>,
  );

  expect(html).toContain(`class="${lottieRootClass}"`);
  expect(html).toContain("<p>a caption</p>");
  expect(html).toContain(`class="${lottieDisplayClass}"`);
});

it("says nothing about a missing container it cannot yet have seen", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  renderToString(
    <Lottie src={ANIMATION}>
      <p>everything except the animation</p>
    </Lottie>,
  );

  /*
   * The count is read from an effect, and effects do not run on a server, so
   * the warning belongs to the browser alone. Warning here would fire on every
   * server render of a perfectly correct page.
   */
  expect(warn).not.toHaveBeenCalled();
});

it.skipIf(reactMajor < 19)(
  "names each stylesheet once, however many animations are rendered",
  () => {
    const html = renderToString(
      <>
        <Lottie src={ANIMATION} />
        <Lottie src={ANIMATION} />
        <Lottie src={ANIMATION}>
          <LottieDisplay />
        </Lottie>
      </>,
    );

    /*
     * The token set rather than the element count. This path merges every sheet
     * sharing a precedence into one element carrying a space-separated list, so a
     * count would be measuring React's merging rather than our deduplication.
     */
    const tokens = [...html.matchAll(/data-href="([^"]*)"/g)].flatMap((match) =>
      match[1].split(" "),
    );
    expect(new Set(tokens)).toEqual(
      new Set([lottieDisplayClass, lottieRootClass]),
    );
    expect(tokens).toHaveLength(2);
  },
);

it("draws nothing, because the engine is not there to draw it", () => {
  const html = renderToString(<Lottie src={ANIMATION} />);

  /* The markup arrives sized and empty, and fills in once the browser has it. */
  expect(html).toContain(`<div class="${lottieDisplayClass}"></div>`);
  expect(html).not.toContain("<svg");
});
