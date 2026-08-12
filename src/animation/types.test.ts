import type { LottiePlayer } from "lottie-web";
import { expect, it } from "vitest";
import { installCanvasStub } from "../test/installCanvasStub.js";
import {
  type AllowedAs,
  type BlockContainerTag,
  LottieDirection,
  type LottieHandle,
  LottieRenderer,
  type LottieSeekTarget,
  type LottieSegments,
  LottieState,
  LottieSubscription,
  type MustBeNever,
  type RendererRows,
} from "./types.js";

// Both builds write to a canvas while their module body runs, so the stub has to
// be in place before either dynamic import below is evaluated.
installCanvasStub();

const lottieFull = (await import("lottie-web")).default;
const lottieLight = (await import("lottie-web/build/player/lottie_light.js"))
  .default;

/*
 * The smallest animation lottie-web will load. The dimensions are deliberately
 * unequal, because the SVG renderer copies them into `viewBox`, which is what
 * tells a real render apart from a stand-in returning a fixed element.
 */
const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 123,
  h: 45,
  nm: "contract",
  ddd: 0,
  assets: [],
  layers: [],
};

/*
 * The evidence for the two columns of the renderer table that no type can
 * check. `isBlock` and `inLight` are typed *from* that table rather than
 * written down a second time, so a row whose claim stops matching the evidence
 * below fails to compile rather than passing a test that no longer means
 * anything.
 */
const EXPECTED: {
  [K in LottieRenderer]: {
    tagName: string;
    isBlock: RendererRows[K]["puts"] extends "block" ? true : false;
    inLight: RendererRows[K]["inLight"];
  };
} = {
  svg: { tagName: "svg", isBlock: false, inLight: true },
  canvas: { tagName: "CANVAS", isBlock: false, inLight: false },
  html: { tagName: "DIV", isBlock: true, inLight: false },
};

function isLottieRenderer(name: string): name is LottieRenderer {
  return name in LottieRenderer;
}

/*
 * Derived from the table rather than listed, so a renderer added to it without
 * evidence here cannot slip through: it arrives already carrying a case.
 */
const RENDERERS = Object.keys(EXPECTED).filter(isLottieRenderer);
const IN_LIGHT = RENDERERS.filter((renderer) => EXPECTED[renderer].inLight);
const NOT_IN_LIGHT = RENDERERS.filter(
  (renderer) => !EXPECTED[renderer].inLight,
);

function render<T extends LottieRenderer>(player: LottiePlayer, renderer: T) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const animation = player.loadAnimation({
    container,
    renderer,
    loop: false,
    autoplay: false,
    animationData: ANIMATION,
  });

  return { animation, container };
}

/*
 * What each renderer appends is the first of the two facts a type cannot state,
 * and the `as` prop rests on it: an inline tag can hold what svg and canvas
 * append, and only a block-capable tag can hold what html appends.
 */
it.each(RENDERERS)(
  "the full build's %s renderer appends the element the table claims",
  (renderer) => {
    const { tagName, isBlock } = EXPECTED[renderer];
    const { animation, container } = render(lottieFull, renderer);
    const appended = container.firstElementChild;

    // SVG elements report a lowercase tagName because they are in the SVG
    // namespace, where HTML elements report theirs uppercase.
    expect(appended?.tagName).toBe(tagName);
    expect(container.childElementCount).toBe(1);

    /*
     * The `puts` column, checked against the browser's own answer rather than
     * against anything we wrote. happy-dom leaves `display` empty for `<svg>`
     * and `<canvas>` because its default stylesheet says nothing about them,
     * so the claim has to be read as "is block" rather than "equals inline".
     */
    const display = appended === null ? "" : getComputedStyle(appended).display;
    expect(display === "block").toBe(isBlock);

    animation.destroy();

    expect(container.childElementCount).toBe(0);
  },
);

it("renders the animation it was handed rather than a fixed element", () => {
  const { animation, container } = render(lottieFull, LottieRenderer.svg);

  expect(container.firstElementChild?.getAttribute("viewBox")).toBe(
    "0 0 123 45",
  );

  animation.destroy();
});

it.each(IN_LIGHT)(
  "the light build's %s renderer appends the same one element",
  (renderer) => {
    const { tagName } = EXPECTED[renderer];
    const { animation, container } = render(lottieLight, renderer);

    expect(container.firstElementChild?.tagName).toBe(tagName);
    expect(container.childElementCount).toBe(1);

    animation.destroy();

    expect(container.childElementCount).toBe(0);
  },
);

/*
 * The second fact a type cannot state, and the declarations do not merely omit
 * it, they assert the opposite: the light build ships the full build's types
 * verbatim, so a renderer it does not contain still compiles.
 */
it.each(NOT_IN_LIGHT)(
  "the light build has no %s renderer, which its own types advertise",
  (renderer) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // The message is not asserted, because it names an internal variable of
    // lottie-web's unminified build. The full build accepting this same renderer
    // above is what shows the throw belongs to the light build, not to this test.
    expect(() =>
      lottieLight.loadAnimation({
        container,
        renderer,
        loop: false,
        autoplay: false,
        animationData: ANIMATION,
      }),
    ).toThrow();

    expect(container.childElementCount).toBe(0);
  },
);

/*
 * Everything below is checked by `tsc` rather than by vitest, and none of it
 * runs. Each negative case is an assignment the type has to refuse: if it ever
 * stops refusing, the directive above it becomes unused and `tsc` reports
 * TS2578, so a case cannot quietly stop testing anything.
 */

const _inlineTagHoldsSvg: AllowedAs<"span", undefined, "svg"> = "span";
const _inlineTagHoldsCanvas: AllowedAs<"span", undefined, "canvas"> = "span";
const _blockTagHoldsHtml: AllowedAs<"section", undefined, "html"> = "section";
const _blockTagHoldsChildren: AllowedAs<"section", "children", "svg"> =
  "section";

// A transparent content model may hold a block, so a link wrapper is valid.
const _linkHoldsHtml: AllowedAs<"a", undefined, "html"> = "a";
const _linkHoldsChildren: AllowedAs<"a", "children", "svg"> = "a";

// @ts-expect-error a void element cannot hold an animation
const _voidTagRefused: AllowedAs<"img", undefined, "svg"> = "img";
// @ts-expect-error this element's children already mean something else
const _reservedTagRefused: AllowedAs<"video", undefined, "svg"> = "video";
// @ts-expect-error the html renderer appends a <div>, which an inline tag cannot hold
const _inlineTagRefusedForHtml: AllowedAs<"span", undefined, "html"> = "span";
// @ts-expect-error children are placed in a <div>, which an inline tag cannot hold
const _inlineTagRefusedForChildren: AllowedAs<"span", "children", "svg"> =
  "span";

/*
 * The settings column is paired with the renderer that reads it. Each directive
 * sits on the offending property rather than on the declaration, because an
 * excess property is reported where it appears, and the formatter decides
 * whether that is the same line as the declaration or a later one.
 */
const _svgTakesItsOwn: RendererRows["svg"]["settings"] = { viewBoxOnly: true };
const _canvasTakesItsOwn: RendererRows["canvas"]["settings"] = { dpr: 2 };
const _svgRefusesCanvas: RendererRows["svg"]["settings"] = {
  // @ts-expect-error dpr belongs to the canvas renderer
  dpr: 2,
};
const _canvasRefusesSvg: RendererRows["canvas"]["settings"] = {
  // @ts-expect-error viewBoxOnly belongs to the svg renderer
  viewBoxOnly: true,
};

/*
 * A seek target names exactly one unit, and the obvious way to write that does
 * not work: a plain union of single-key objects accepts a literal combining two
 * of them, because the excess-property check against a union admits a property
 * belonging to any member. Each member therefore declares the other units as
 * optional-never, and the cases below are what hold that in place.
 *
 * Every directive sits on the offending property rather than on the
 * declaration, since an excess property is reported where it appears.
 */
const _frameShorthand: LottieSeekTarget = 30;
const _frameNamed: LottieSeekTarget = { frame: 30 };
const _markerTarget: LottieSeekTarget = { marker: "intro" };
const _percentTarget: LottieSeekTarget = { percent: 50 };
const _secondsTarget: LottieSeekTarget = { seconds: 1.5 };

const _twoUnitsRefused: LottieSeekTarget = {
  marker: "intro",
  // @ts-expect-error a target names one unit, not two
  seconds: 1.5,
};
const _twoNumericUnitsRefused: LottieSeekTarget = {
  frame: 30,
  // @ts-expect-error a target names one unit, not two
  percent: 50,
};
const _foreignKeyRefused: LottieSeekTarget = {
  // @ts-expect-error there is no such unit
  nonsense: true,
};
// @ts-expect-error a target has to name a unit
const _emptyTargetRefused: LottieSeekTarget = {};
const _wrongUnitTypeRefused: LottieSeekTarget = {
  // @ts-expect-error a marker is named by a string
  marker: 30,
};

/* A range is absolute frames or a marker naming a span, and never both. */
const _oneRange: LottieSegments = [0, 30];
const _severalRanges: LottieSegments = [
  [0, 30],
  [40, 50],
];
const _markerSpan: LottieSegments = { marker: "idle" };
const _rangeAndMarkerRefused: LottieSegments = {
  marker: "idle",
  // @ts-expect-error a range is described one way or the other
  frame: 30,
};

/*
 * The natural home for named ranges is an `as const` map, whose tuples are
 * `readonly`. These held mutable-only until 2026-08-12, so the map below is
 * what pins the acceptance.
 */
const constParts = { intro: [0, 30], outro: [40, 50] } as const;
const _readonlyRange: LottieSegments = constParts.intro;
const _readonlyList: LottieSegments = [constParts.intro, constParts.outro];

/*
 * `BlockContainerTag` is derived by exclusion, so a tag React adds later falls
 * through all three lists and is silently treated as a valid block container,
 * which is the most permissive answer and the wrong default. Pinning the set
 * here is what gives the exhaustiveness check something to disagree with, and
 * the two assertions catch the two ways it can drift: a tag nobody classified,
 * and a tag classified into the wrong list.
 */
type TagWithBlockChildren =
  | "a"
  | "address"
  | "article"
  | "aside"
  | "blockquote"
  | "caption"
  | "dd"
  | "del"
  | "details"
  | "dialog"
  | "div"
  | "dt"
  | "fieldset"
  | "figcaption"
  | "figure"
  | "footer"
  | "form"
  | "header"
  | "ins"
  | "li"
  | "main"
  | "nav"
  | "search"
  | "section"
  | "td"
  | "th";

type _NoTagWentUnclassified = MustBeNever<
  Exclude<BlockContainerTag, TagWithBlockChildren>
>;
type _NoTagWasOverclassified = MustBeNever<
  Exclude<TagWithBlockChildren, BlockContainerTag>
>;

/*
 * Each vocabulary is a map from a name to the string a consumer may write, and
 * the two are meant to be the same word. Nothing in the type system says so,
 * because `as const` is happy with any value, so it is asserted here. A member
 * whose string drifts from its name is a public API a reader cannot predict.
 */
it.each([
  ["LottieRenderer", LottieRenderer],
  ["LottieState", LottieState],
  ["LottieDirection", LottieDirection],
  ["LottieSubscription", LottieSubscription],
])("every %s member's string is its own name", (_, vocabulary) => {
  for (const [name, value] of Object.entries(vocabulary)) {
    expect(value).toBe(name);
  }
});

/*
 * `LottieHandle` is derived from `LottieInstance` by exclusion, so the risk is
 * not that it says the wrong thing today but that a member added to the
 * instance later arrives on the handle unnoticed. Both directions are pinned:
 * everything a handle must carry, and nothing beyond it.
 */
type ExpectedHandleKeys =
  | "reload"
  | "play"
  | "pause"
  | "stop"
  | "seek"
  | "scrubStart"
  | "scrubTo"
  | "scrubEnd"
  | "playSegments"
  | "resetSegments"
  | "setSpeed"
  | "setDirection"
  | "setLoop"
  | "animationItem";

type _HandleCarriesEveryCommand = MustBeNever<
  Exclude<ExpectedHandleKeys, keyof LottieHandle>
>;
/*
 * The half that catches a member arriving by accident. It is also what asserts
 * the exclusions: `state` and `subscribe` are absent from the expected list, so
 * either one reappearing on the handle fails here.
 */
type _HandleCarriesNothingElse = MustBeNever<
  Exclude<keyof LottieHandle, ExpectedHandleKeys>
>;
