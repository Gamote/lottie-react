import { expect, it } from "vitest";
import { normalizeAnimationSource } from "./normalizeAnimationSource.js";

it("reads a string as a path", () => {
  expect(normalizeAnimationSource("/animations/hero.json")).toEqual({
    path: "/animations/hero.json",
  });
});

it("trims a path, so a stray newline in a template literal is not a 404", () => {
  expect(normalizeAnimationSource("  /hero.json \n")).toEqual({
    path: "/hero.json",
  });
});

it("reads an object as the animation itself", () => {
  expect(normalizeAnimationSource({ v: "5.5.7", fr: 30 })).toEqual({
    animationData: { v: "5.5.7", fr: 30 },
  });
});

it.each([
  ["an empty string", ""],
  ["a string of spaces", "   "],
  ["null", null],
  ["undefined", undefined],
  ["an array", [1, 2]],
  ["a number", 42],
  ["a boolean", true],
])("refuses %s", (_, source) => {
  expect(normalizeAnimationSource(source)).toBeNull();
});

it("copies the object rather than handing over the caller's own", () => {
  const original = { v: "5.5.7", fr: 30 };
  const normalized = normalizeAnimationSource(original);

  expect(normalized).toEqual({ animationData: original });
  if (normalized === null || !("animationData" in normalized)) {
    throw new Error("expected an animationData source");
  }
  expect(normalized.animationData).not.toBe(original);
});

/*
 * lottie-web writes `__complete` onto the object it is given, which throws on
 * anything frozen. The assertion is the engine's own write rather than "a copy
 * was made", so it fails for the reason that matters rather than for the shape
 * of the implementation.
 */
it("gives the engine something it can annotate, even from a frozen source", () => {
  const frozen = Object.freeze({ v: "5.5.7", fr: 30 });
  const normalized = normalizeAnimationSource(frozen);

  expect(normalized).not.toBeNull();
  if (normalized === null || !("animationData" in normalized)) {
    throw new Error("expected an animationData source");
  }

  expect(() => {
    Object.assign(normalized.animationData, { __complete: true });
  }).not.toThrow();

  expect(Object.hasOwn(frozen, "__complete")).toBe(false);
});
