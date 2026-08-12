import { expect, it } from "vitest";
import { collectMarkerCrossings } from "./collectMarkerCrossings.js";
import type { LottieMarker } from "./resolveSeekTarget.js";

const MARKERS: readonly LottieMarker[] = [
  { time: 10, duration: 0, payload: { name: "intro" } },
  { time: 30, duration: 5, payload: { name: "middle" } },
  { time: 50, duration: 0, payload: { name: "outro" } },
];

it("returns null for an empty marker list", () => {
  expect(collectMarkerCrossings([], 0, 0, 60)).toBeNull();
});

it("returns null when the playhead has not moved", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 30, 30)).toBeNull();
});

it("returns null when nothing sits between the two frames", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 11, 29)).toBeNull();
  expect(collectMarkerCrossings(MARKERS, 0, 51, 59)).toBeNull();
});

it("collects a forward pass in the order the playhead met them", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 5, 55)).toEqual([
    "intro",
    "middle",
    "outro",
  ]);
});

it("announces a marker the playhead lands on exactly", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 25, 30)).toEqual(["middle"]);
});

it("does not repeat a marker the playhead moves away from", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 30, 35)).toBeNull();
});

it("collects a backward pass in the order the playhead met them", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 55, 5)).toEqual([
    "outro",
    "middle",
    "intro",
  ]);
});

it("announces an exact landing when moving backward too", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 35, 30)).toEqual(["middle"]);
});

it("does not repeat a marker moved away from backward either", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 30, 25)).toBeNull();
});

it("announces subframe movement that steps over a marker", () => {
  expect(collectMarkerCrossings(MARKERS, 0, 29.97, 30.02)).toEqual(["middle"]);
});

it("measures positions inside the playable range a segment leaves", () => {
  /* With `firstFrame` 20, the marker at file frame 30 sits at range frame 10,
     and the one at file frame 10 sits before the range and can never fire. */
  expect(collectMarkerCrossings(MARKERS, 20, 5, 15)).toEqual(["middle"]);
  expect(collectMarkerCrossings(MARKERS, 20, -15, -5)).toEqual(["intro"]);
});
