import { createRef } from "react";
import { expect, it, vi } from "vitest";
import { mergeRefs } from "./mergeRefs.js";

/*
 * React 18 and React 19 tear a ref down differently, and this library promises
 * both. Only one of the two paths can be exercised by rendering, because only
 * one React is installed, so they are driven directly here instead: calling the
 * merged callback with `null` is what React 18 does, and calling the function it
 * returns is what React 19 does.
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

  const teardown = mergeRefs(undefined, object, null)(node);
  teardown?.();

  expect(object.current).toBeNull();
});

it("clears everything when React 18 calls it with null", () => {
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
  const node = document.createElement("div");

  const teardown = mergeRefs(object, callback)(node);
  teardown?.();

  expect(object.current).toBeNull();
  expect(callback).toHaveBeenLastCalledWith(null);
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
