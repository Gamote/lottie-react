import type { AnimationItem } from "lottie-web";
import lottie from "lottie-web";
import { expect, it } from "vitest";
import { resolveSeekTarget, resolveSegments } from "./resolveSeekTarget.js";
import type { LottieSeekTarget } from "./types.js";

/**
 * 60 frames at 30fps, with a marker that labels a point and one that labels a
 * span. The third is the case the engine cannot address either: a comment that
 * parsed as JSON but carries no name.
 */
const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "resolve",
  ddd: 0,
  assets: [],
  layers: [],
  markers: [
    { tm: 30, cm: "middle", dr: 0 },
    { tm: 10, cm: "chapter", dr: 20 },
    { tm: 55, cm: "late", dr: 0 },
    { tm: 45, cm: '{"unnamed":true}', dr: 0 },
  ],
};

/** A real animation, because the resolver reads the engine's own fields. */
function load(overrides: object = {}): AnimationItem {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: false,
    autoplay: false,
    animationData: { ...ANIMATION, ...overrides },
  });
}

/** Resolves against a throwaway animation, since nothing here needs it after. */
function seek(item: AnimationItem, target: LottieSeekTarget) {
  const resolved = resolveSeekTarget(item, target);
  item.destroy();
  return resolved;
}

it("reads a plain number as a frame", () => {
  expect(seek(load(), 30)).toEqual({ frame: 30, requested: 30 });
});

it("reads the four named units", () => {
  expect(seek(load(), { frame: 30 })).toEqual({ frame: 30, requested: 30 });
  expect(seek(load(), { percent: 50 })).toEqual({ frame: 30, requested: 30 });
  expect(seek(load(), { seconds: 1 })).toEqual({ frame: 30, requested: 30 });
  expect(seek(load(), { marker: "middle" })).toEqual({
    frame: 30,
    requested: 30,
  });
});

it("scopes percent and seconds to the playable range, not the file", () => {
  const item = load();
  item.setSegment(20, 40);

  expect(resolveSeekTarget(item, { percent: 50 })?.frame).toBe(10);
  expect(resolveSeekTarget(item, { seconds: 0.5 })?.frame).toBe(15);

  item.destroy();
});

/*
 * The engine writes `marker.time` into a field it later reads as an offset into
 * the playable range, so its own marker seeking is wrong by `firstFrame` for
 * every animation with an in-point or an active segment. Ours subtracts it.
 */
it("resolves a marker to where the designer placed it", () => {
  const item = load({ ip: 20, op: 80 });

  // The marker is at file frame 30, which is 10 frames into a range that
  // starts at 20. The engine would answer 30 and render file frame 50.
  expect(resolveSeekTarget(item, { marker: "middle" })?.frame).toBe(10);

  item.destroy();
});

it("holds a marker outside the playable range at the nearest end", () => {
  const item = load();
  item.setSegment(20, 40);

  // Before the range: the marker is at file frame 10, the range starts at 20.
  expect(resolveSeekTarget(item, { marker: "chapter" })).toEqual({
    frame: 0,
    requested: -10,
  });
  // After it: the marker is at file frame 55, the range ends at 40.
  expect(resolveSeekTarget(item, { marker: "late" })).toEqual({
    frame: 19.999,
    requested: 35,
  });

  item.destroy();
});

it("clamps a frame outside the playable range, reporting what was asked", () => {
  expect(seek(load(), 999)).toEqual({ frame: 59.999, requested: 999 });
  expect(seek(load(), -50)).toEqual({ frame: 0, requested: -50 });
  /*
   * A hundred percent now lands at the end of the movement rather than at the
   * start of the last frame. The engine draws between frames, so the final
   * frame's own span is real motion and stopping short of it discarded it.
   */
  expect(seek(load(), { percent: 100 })).toEqual({
    frame: 59.999,
    requested: 60,
  });
});

it("resolves nothing for a marker the animation does not have", () => {
  expect(seek(load(), { marker: "nope" })).toBeNull();
});

/*
 * The engine derives a marker's payload from the After Effects comment, trying
 * JSON first. A comment that parses but has no `name` leaves a marker nothing
 * can address, here or in the engine, so a designer can label a point the code
 * cannot reach.
 */
it("resolves nothing for a marker whose comment carries no name", () => {
  expect(seek(load(), { marker: "unnamed" })).toBeNull();
});

it("resolves nothing for a number that is not finite", () => {
  expect(seek(load(), Number.NaN)).toBeNull();
  expect(seek(load(), Number.POSITIVE_INFINITY)).toBeNull();
  expect(seek(load(), { seconds: Number.NaN })).toBeNull();
});

/*
 * `markers` is undeclared, so the shape it has at runtime is an assumption
 * rather than a promise. Every entry is checked, and one that does not hold up
 * is skipped rather than trusted.
 */
it("ignores entries that are not markers we can use", () => {
  const item = load();
  Object.assign(item, {
    markers: [
      "not an object",
      null,
      { payload: { name: "noTime" } },
      { time: "1", payload: { name: "timeIsAString" } },
      { time: 1, duration: "20", payload: { name: "durationIsAString" } },
      { time: 2 },
      { time: 3, payload: null },
      { time: 4, payload: { unnamed: true } },
      { time: 5, payload: { name: 6 } },
      { time: 7, payload: { name: "usable" } },
    ],
  });

  for (const name of [
    "noTime",
    "timeIsAString",
    "durationIsAString",
    "unnamed",
  ]) {
    expect(resolveSeekTarget(item, { marker: name })).toBeNull();
  }
  expect(resolveSeekTarget(item, { marker: "usable" })?.frame).toBe(7);

  item.destroy();
});

it("resolves nothing when the engine has no markers to read", () => {
  const withoutTheProperty = load();
  Reflect.deleteProperty(withoutTheProperty, "markers");
  expect(seek(withoutTheProperty, { marker: "middle" })).toBeNull();

  const withSomethingElse = load();
  Object.assign(withSomethingElse, { markers: "not a list" });
  expect(seek(withSomethingElse, { marker: "middle" })).toBeNull();
});

it("takes one range, a list of them, and a reversed one", () => {
  const item = load();

  expect(resolveSegments(item, [0, 30])).toEqual([[0, 30]]);
  expect(
    resolveSegments(item, [
      [0, 10],
      [20, 30],
    ]),
  ).toEqual([
    [0, 10],
    [20, 30],
  ]);
  // Reversed is meaningful: it plays the range backwards.
  expect(resolveSegments(item, [40, 10])).toEqual([[40, 10]]);

  item.destroy();
});

/*
 * The engine queues whatever arrays it is handed, so returning the caller's
 * own would let a later mutation reach into playback, and would hand over
 * tuples the types promise stay `readonly`.
 */
it("hands the engine fresh arrays, never the caller's own", () => {
  const item = load();

  const single: [number, number] = [0, 30];
  const fromSingle = resolveSegments(item, single);
  expect(fromSingle).toEqual([[0, 30]]);
  expect(fromSingle?.[0]).not.toBe(single);

  const parts = { intro: Object.freeze([0, 30] as const) };
  const fromFrozen = resolveSegments(item, [parts.intro]);
  expect(fromFrozen).toEqual([[0, 30]]);
  expect(fromFrozen?.[0]).not.toBe(parts.intro);

  item.destroy();
});

/*
 * A marker carrying a duration labels a span, and a range endpoint is an
 * absolute position in the file, so the correction seeking needs would be wrong
 * here. The engine agrees with us on this path and only disagrees on the other.
 */
it("takes a marker that labels a span, in absolute frames", () => {
  const item = load({ ip: 20, op: 80 });

  expect(resolveSegments(item, { marker: "chapter" })).toEqual([[10, 30]]);

  item.destroy();
});

it("refuses a range that describes nothing playable", () => {
  const item = load();

  expect(resolveSegments(item, [20, 20])).toBeNull();
  expect(resolveSegments(item, [0, Number.NaN])).toBeNull();
  expect(resolveSegments(item, [Number.POSITIVE_INFINITY, 10])).toBeNull();
  expect(resolveSegments(item, [])).toBeNull();
  expect(
    resolveSegments(item, [
      [0, 10],
      [20, 20],
    ]),
  ).toBeNull();

  item.destroy();
});

/*
 * A marker with no duration is a labelled position rather than a labelled span.
 * The engine responds to one by playing the entire animation; we refuse, and
 * the caller is told to seek to it and play instead.
 */
it("refuses a marker that labels a point rather than a span", () => {
  const item = load();

  expect(resolveSegments(item, { marker: "middle" })).toBeNull();
  expect(resolveSegments(item, { marker: "nope" })).toBeNull();

  item.destroy();
});
