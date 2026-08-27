import { createRef } from "react";
import { expect, it, vi } from "vitest";
import { mergeRefs } from "./mergeRefs.js";

/*
 * React 18 and React 19 tear a ref down differently, and this library promises
 * both. A render exercises only the installed React's path, so both are driven
 * directly here: calling the merged callback with `null` is what React 18
 * always does and what React 19 does when nothing was returned; calling the
 * function it returns is what React 19 does when one was.
 */

it("writes the element to every ref it was given", () => {
  const object = createRef<HTMLDivElement>();
  const callback = vi.fn();
  const node = document.createElement("div");

  mergeRefs(object, callback)(node);

  expect(object.current).toBe(node);
  expect(callback).toHaveBeenCalledWith(node);
});

it("ignores the refs that are not there", () => {
  const object = createRef<HTMLDivElement>();
  const node = document.createElement("div");
  const merged = mergeRefs(undefined, object, null);

  merged(node);
  merged(null);

  expect(object.current).toBeNull();
});

it("ignores the refs that are not there on the teardown it returned", () => {
  const object = createRef<HTMLDivElement>();
  const cleanup = vi.fn();
  const withCleanup = vi.fn(() => cleanup);
  const node = document.createElement("div");

  const teardown = mergeRefs(undefined, object, null, withCleanup)(node);
  teardown?.();

  expect(object.current).toBeNull();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it("returns nothing when no ref returned a cleanup, so React 18 has nothing to report", () => {
  const object = createRef<HTMLDivElement>();
  const callback = vi.fn();

  expect(
    mergeRefs(object, callback)(document.createElement("div")),
  ).toBeUndefined();
});

it("clears everything when React calls it with null", () => {
  const object = createRef<HTMLDivElement>();
  const callback = vi.fn();
  const node = document.createElement("div");
  const merged = mergeRefs(object, callback);

  merged(node);
  merged(null);

  expect(object.current).toBeNull();
  expect(callback).toHaveBeenLastCalledWith(null);
});

it("clears everything when React 19 runs the cleanup it returned", () => {
  const object = createRef<HTMLDivElement>();
  const callback = vi.fn();
  const cleanup = vi.fn();
  const withCleanup = vi.fn(() => cleanup);
  const node = document.createElement("div");

  const teardown = mergeRefs(object, callback, withCleanup)(node);
  teardown?.();

  expect(object.current).toBeNull();
  expect(callback).toHaveBeenLastCalledWith(null);
  expect(cleanup).toHaveBeenCalledTimes(1);
});

it("runs a ref's own cleanup rather than calling it with null", () => {
  const cleanup = vi.fn();
  const callback = vi.fn(() => cleanup);

  const teardown = mergeRefs(callback)(document.createElement("div"));
  teardown?.();

  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).not.toHaveBeenCalledWith(null);
});
