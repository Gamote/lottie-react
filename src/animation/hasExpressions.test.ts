import { expect, it } from "vitest";
import { hasExpressions } from "./hasExpressions.js";

const EXPRESSION = "var $bm_rt;\n$bm_rt = value;";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 100,
  h: 100,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

/** A layer whose transform is the given set of properties. */
function layer(ks: object) {
  return { ...ANIMATION, layers: [{ ks }] };
}

it.each([undefined, null, "x", 3, [], {}])("is false for %j", (value) => {
  expect(hasExpressions(value)).toBe(false);
});

it("is false for an animation without expressions", () => {
  expect(hasExpressions(ANIMATION)).toBe(false);
});

it("finds an expression on a transform property", () => {
  expect(
    hasExpressions(layer({ p: { a: 0, k: [0, 0, 0], x: EXPRESSION } })),
  ).toBe(true);
});

it("finds an expression on a shape path nested in groups", () => {
  const animation = {
    ...ANIMATION,
    layers: [
      {
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                ks: {
                  a: 0,
                  k: { i: [], o: [], v: [], c: true },
                  x: EXPRESSION,
                },
              },
            ],
          },
        ],
      },
    ],
  };
  expect(hasExpressions(animation)).toBe(true);
});

it("finds an expression on an effect value", () => {
  const animation = {
    ...ANIMATION,
    layers: [
      { ef: [{ ty: 5, ef: [{ ty: 0, v: { a: 0, k: 50, x: EXPRESSION } }] }] },
    ],
  };
  expect(hasExpressions(animation)).toBe(true);
});

it("finds an expression on a text document", () => {
  const animation = {
    ...ANIMATION,
    layers: [{ t: { d: { k: [{ s: { t: "Hi" }, t: 0 }], x: EXPRESSION } } }],
  };
  expect(hasExpressions(animation)).toBe(true);
});

it("finds an expression inside a precomp asset", () => {
  const animation = {
    ...ANIMATION,
    assets: [
      { id: "comp_0", layers: [{ ks: { r: { a: 0, k: 0, x: EXPRESSION } } }] },
    ],
  };
  expect(hasExpressions(animation)).toBe(true);
});

/*
 * Keyframe easing handles are also keyed `x`, in both the array and the number
 * form, and are not expressions.
 */
it("ignores keyframe easing handles", () => {
  const animation = layer({
    p: {
      a: 1,
      k: [
        {
          t: 0,
          s: [0, 0, 0],
          i: { x: [0.667], y: [1] },
          o: { x: [0.333], y: [0] },
        },
        { t: 30, s: [10, 10, 0] },
      ],
    },
    r: {
      a: 1,
      k: [
        { t: 0, s: [0], i: { x: 0.667, y: 1 }, o: { x: 0.333, y: 0 } },
        { t: 30, s: [90] },
      ],
    },
  });
  expect(hasExpressions(animation)).toBe(false);
});

/*
 * A mask's expansion is a property keyed `x`, an object rather than a string,
 * which may itself carry an expression.
 */
it("tells a mask expansion from an expression on it", () => {
  const mask = (expansion: object) => ({
    ...ANIMATION,
    layers: [
      {
        masksProperties: [
          { mode: "a", pt: { a: 0, k: {} }, o: { a: 0, k: 100 }, x: expansion },
        ],
      },
    ],
  });
  expect(hasExpressions(mask({ a: 0, k: 0 }))).toBe(false);
  expect(hasExpressions(mask({ a: 0, k: 0, x: EXPRESSION }))).toBe(true);
});

it("ignores an empty expression string, as the engine does", () => {
  expect(hasExpressions(layer({ o: { a: 0, k: 100, x: "" } }))).toBe(false);
});
