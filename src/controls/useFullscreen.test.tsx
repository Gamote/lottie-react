import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  type FullscreenStub,
  installFullscreenStub,
} from "../test/installFullscreenStub.js";
import { useFullscreen } from "./useFullscreen.js";

let stub: FullscreenStub | null = null;

afterEach(() => {
  cleanup();
  stub?.restore();
  stub = null;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

/** An element on the page, which is what the hook is asked about. */
function element(): HTMLElement {
  const node = document.createElement("div");
  document.body.appendChild(node);
  return node;
}

it("has nothing to ask where the browser cannot do it, and says nothing about it", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

  /*
   * No stub: this environment implements no part of the Fullscreen API, so this
   * is the unsupported path itself rather than an imitation of it. The hook the
   * rebuilt one replaces logged a warning from its own body on exactly this
   * path, which meant once per render and once per server render as well.
   */
  const { result } = renderHook(() => useFullscreen(element()));

  expect(result.current.toggle).toBeNull();
  expect(result.current.isFullscreen).toBe(false);
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

it("has nothing to ask before an element arrives", () => {
  stub = installFullscreenStub();

  const { result } = renderHook(() => useFullscreen(null));

  expect(result.current.toggle).toBeNull();
});

it("asks the element it was given", () => {
  stub = installFullscreenStub();
  const root = element();
  const inside = document.createElement("div");
  root.appendChild(inside);

  const { result } = renderHook(() => useFullscreen(root));
  act(() => {
    result.current.toggle?.();
  });

  /*
   * The whole reason the animation carries the root element. Asking the display
   * instead would fill the screen with the animation and leave the controls
   * behind, on a page that can no longer be seen.
   */
  expect(stub.requested).toEqual([root]);
  expect(stub.requested).not.toContain(inside);
});

it("follows the browser's announcement rather than its own request", () => {
  stub = installFullscreenStub();
  const root = element();

  const { result } = renderHook(() => useFullscreen(root));
  act(() => {
    result.current.toggle?.();
  });

  /*
   * Asking is not having. A browser can refuse, and a person can leave with the
   * Escape key without anything here being called, so the announcement is the
   * only thing that can be believed.
   */
  expect(result.current.isFullscreen).toBe(false);

  act(() => {
    stub?.grant(root);
  });
  expect(result.current.isFullscreen).toBe(true);

  act(() => {
    stub?.release();
  });
  expect(result.current.isFullscreen).toBe(false);
});

it("gives the screen back when it is the one that has it", () => {
  stub = installFullscreenStub();
  const root = element();

  const { result } = renderHook(() => useFullscreen(root));
  act(() => {
    stub?.grant(root);
  });
  act(() => {
    result.current.toggle?.();
  });

  expect(stub.exited).toBe(1);
  expect(stub.requested).toEqual([]);
});

it("keeps two animations on one page out of each other's business", () => {
  stub = installFullscreenStub();
  const first = element();
  const second = element();

  const one = renderHook(() => useFullscreen(first));
  const two = renderHook(() => useFullscreen(second));

  act(() => {
    stub?.grant(first);
  });

  /*
   * The listener sits on each element, so the announcement only reaches the one
   * it concerns. Written on the document instead, this is where the second bar
   * to render silently took the first one's `onfullscreenchange` slot and the
   * first stopped hearing anything at all: the property holds one handler, and
   * this environment reproduces that exactly.
   */
  expect(one.result.current.isFullscreen).toBe(true);
  expect(two.result.current.isFullscreen).toBe(false);

  act(() => {
    stub?.release();
  });
  expect(one.result.current.isFullscreen).toBe(false);
});

it("stops listening when the element goes", () => {
  stub = installFullscreenStub();
  const root = element();

  const { result, unmount } = renderHook(() => useFullscreen(root));
  unmount();

  act(() => {
    stub?.grant(root);
  });

  expect(result.current.isFullscreen).toBe(false);
});

it("reports a refusal while developing, and keeps the state it had", async () => {
  stub = installFullscreenStub();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const root = element();
  stub.refuseNext();

  const { result } = renderHook(() => useFullscreen(root));
  await act(async () => {
    result.current.toggle?.();
  });

  expect(result.current.isFullscreen).toBe(false);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toContain("refused to change fullscreen");
});
