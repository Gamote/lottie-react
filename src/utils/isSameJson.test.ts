import { expect, it } from "vitest";
import { isSameJson } from "./isSameJson.js";

it.each([
  ["identical primitives", 1, 1],
  ["two NaNs, which === would refuse", Number.NaN, Number.NaN],
  ["equal strings", "a", "a"],
  ["two nulls", null, null],
  ["equal flat objects", { a: 1 }, { a: 1 }],
  ["keys in a different order", { a: 1, b: 2 }, { b: 2, a: 1 }],
  ["equal arrays", [1, 2], [1, 2]],
  ["nested arrays and objects", { l: [1, { d: [2] }] }, { l: [1, { d: [2] }] }],
  ["an empty object", {}, {}],
  ["an empty array", [], []],
])("says %s are the same", (_, a, b) => {
  expect(isSameJson(a, b)).toBe(true);
});

it.each([
  ["different numbers", 1, 2],
  ["a number and a string", 1, "1"],
  ["null and an object", null, {}],
  ["null and undefined", null, undefined],
  ["an object with an extra key", { a: 1 }, { a: 1, b: 2 }],
  ["an object with a different key of the same count", { a: 1 }, { b: 1 }],
  ["a differing nested value", { l: [1, { d: 2 }] }, { l: [1, { d: 3 }] }],
  ["arrays of different lengths", [1], [1, 2]],
  ["arrays with different contents", [1, 2], [1, 3]],
  ["an array and an object", [], {}],
  ["an object and an array", {}, []],
  ["an object and a primitive", { a: 1 }, "a"],
  ["a key present but undefined against an absent one", { a: undefined }, {}],
])("says %s differ", (_, a, b) => {
  expect(isSameJson(a, b)).toBe(false);
});

it("compares content rather than identity, which is the whole point", () => {
  const animation = { v: "5.5.7", fr: 30, layers: [{ ty: 1, ks: {} }] };
  const copy = structuredClone(animation);

  expect(copy).not.toBe(animation);
  expect(isSameJson(animation, copy)).toBe(true);

  copy.layers[0].ty = 2;
  expect(isSameJson(animation, copy)).toBe(false);
});
