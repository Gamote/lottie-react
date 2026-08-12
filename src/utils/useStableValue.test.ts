import { renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useStableValue } from "./useStableValue.js";

it("returns what it was given the first time", () => {
  const value = { a: 1 };
  const { result } = renderHook(() => useStableValue(value));

  expect(result.current).toBe(value);
});

it("keeps the first value when an equal one is built again", () => {
  const { result, rerender } = renderHook(
    ({ value }: { value: { a: number } }) => useStableValue(value),
    { initialProps: { value: { a: 1 } } },
  );
  const first = result.current;

  rerender({ value: { a: 1 } });
  rerender({ value: { a: 1 } });

  expect(result.current).toBe(first);
});

it("takes the new value when the content changes", () => {
  const { result, rerender } = renderHook(
    ({ value }: { value: { a: number } }) => useStableValue(value),
    { initialProps: { value: { a: 1 } } },
  );
  const first = result.current;

  rerender({ value: { a: 2 } });

  expect(result.current).not.toBe(first);
  expect(result.current).toEqual({ a: 2 });
});

it("passes a primitive straight through", () => {
  const { result, rerender } = renderHook(
    ({ value }: { value: string }) => useStableValue(value),
    { initialProps: { value: "a" } },
  );

  expect(result.current).toBe("a");
  rerender({ value: "b" });
  expect(result.current).toBe("b");
});

it("keeps the same reference when the same one is passed again", () => {
  const value = { a: 1 };
  const { result, rerender } = renderHook(
    ({ next }: { next: { a: number } }) => useStableValue(next),
    { initialProps: { next: value } },
  );

  rerender({ next: value });

  expect(result.current).toBe(value);
});
