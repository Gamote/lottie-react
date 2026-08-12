import { expect, it } from "vitest";
import { bandEdges, bandProgress, coverProgress } from "./coverProgress.js";

const VIEWPORT = { width: 800, height: 600 };

it("runs 0 to 1 across the whole journey, clamped outside it", () => {
  const rect = (top: number) => ({ top, left: 0, width: 100, height: 200 });

  /* Leading edge at the viewport's bottom: the journey begins. */
  expect(coverProgress(rect(600), VIEWPORT, "block")).toBe(0);
  /* Trailing edge past the top: the journey is over. */
  expect(coverProgress(rect(-200), VIEWPORT, "block")).toBe(1);
  /* Halfway through the 800px of travel. */
  expect(coverProgress(rect(200), VIEWPORT, "block")).toBe(0.5);
  /* Beyond either end it holds, rather than running past. */
  expect(coverProgress(rect(700), VIEWPORT, "block")).toBe(0);
  expect(coverProgress(rect(-300), VIEWPORT, "block")).toBe(1);
});

it("measures the inline axis with the inline geometry", () => {
  const rect = { top: 0, left: 350, width: 100, height: 50 };
  expect(coverProgress(rect, VIEWPORT, "inline")).toBe(0.5);
});

it("answers 0 rather than dividing by nothing", () => {
  const rect = { top: 0, left: 0, width: 0, height: 0 };
  expect(coverProgress(rect, { width: 0, height: 0 }, "block")).toBe(0);
});

it("maps a band of the journey onto 0 to 1, clamped at its ends", () => {
  expect(bandProgress(0.2, [0.2, 0.45])).toBe(0);
  expect(bandProgress(0.325, [0.2, 0.45])).toBeCloseTo(0.5);
  expect(bandProgress(0.45, [0.2, 0.45])).toBe(1);
  expect(bandProgress(0.1, [0.2, 0.45])).toBe(0);
  expect(bandProgress(0.9, [0.2, 0.45])).toBe(1);
});

it("treats an empty band as a threshold", () => {
  expect(bandProgress(0.29, [0.3, 0.3])).toBe(0);
  expect(bandProgress(0.31, [0.3, 0.3])).toBe(1);
});

it("names the edges a movement crosses, with its direction", () => {
  /* The first sample: inside counts as entering forward, outside is nothing. */
  expect(bandEdges(null, 0.5)).toEqual({ enter: "forward" });
  expect(bandEdges(null, 0)).toEqual({});

  expect(bandEdges(0, 0.4)).toEqual({ enter: "forward" });
  expect(bandEdges(0.4, 1)).toEqual({ leave: "forward" });
  expect(bandEdges(1, 0.6)).toEqual({ enter: "backward" });
  expect(bandEdges(0.6, 0)).toEqual({ leave: "backward" });

  /* Standing still, or moving while pinned, is no edge at all. */
  expect(bandEdges(0.4, 0.4)).toEqual({});
  expect(bandEdges(1, 1)).toEqual({});

  /* One stride across the whole band reports both edges in its direction. */
  expect(bandEdges(0, 1)).toEqual({ enter: "forward", leave: "forward" });
  expect(bandEdges(1, 0)).toEqual({ enter: "backward", leave: "backward" });
});
