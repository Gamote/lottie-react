import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { Lottie } from "../animation/Lottie.js";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import {
  type FullscreenStub,
  installFullscreenStub,
} from "../test/installFullscreenStub.js";
import { LottieControls } from "./LottieControls.js";
import { lottieLoopClass } from "./LottieLoopButton.js";
import { lottiePlayClass } from "./LottiePlayButton.js";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 123,
  h: 45,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

let stub: FullscreenStub | null = null;

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  stub?.restore();
  stub = null;
  vi.restoreAllMocks();
});

function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

/** The whole thing, one animation with a bar under it. */
function renderBar(source: string | object = ANIMATION): HTMLElement {
  render(
    <Lottie src={source} data-testid="root">
      <LottieDisplay />
      <LottieControls />
      <input data-testid="caption" />
    </Lottie>,
  );
  const root = document.querySelector<HTMLElement>("[data-testid=root]");
  if (root === null) {
    throw new Error("no animation was rendered");
  }
  return root;
}

function find(styleClass: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`.${styleClass}`);
  if (element === null) {
    throw new Error(`no .${styleClass} was rendered`);
  }
  return element;
}

function label(): string | null {
  return find(lottiePlayClass).getAttribute("aria-label");
}

/** A consumer's own text field, sitting among the children of the animation. */
function caption(): HTMLInputElement {
  const element = document.querySelector<HTMLInputElement>(
    "[data-testid=caption]",
  );
  if (element === null) {
    throw new Error("no caption field was rendered");
  }
  return element;
}

it("plays and pauses on k, from anywhere inside the animation", () => {
  const root = renderBar();
  flushLoad();
  expect(label()).toBe("Play");

  const prevented = !fireEvent.keyDown(root, { key: "k" });

  expect(label()).toBe("Pause");
  /* Taken from the browser, because the key did something here instead. */
  expect(prevented).toBe(true);

  fireEvent.keyDown(root, { key: "k" });
  expect(label()).toBe("Play");
});

it("loops on l, and keeps a count of repeats through the key as well", () => {
  render(
    <Lottie src={ANIMATION} loop={3} data-testid="root">
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();
  const root = find("lottie-root");
  expect(find(lottieLoopClass).getAttribute("aria-pressed")).toBe("true");

  fireEvent.keyDown(root, { key: "l" });
  expect(find(lottieLoopClass).getAttribute("aria-pressed")).toBe("false");

  /*
   * Off with the key and back on with the button, which is the case a memory
   * held inside the button could not serve: the two would each remember their
   * own last value and `loop={3}` would quietly become `loop={true}`.
   */
  fireEvent.click(find(lottieLoopClass));
  expect(find(lottieLoopClass).getAttribute("aria-pressed")).toBe("true");
});

it("fills the screen on f", () => {
  stub = installFullscreenStub();
  const root = renderBar();
  flushLoad();

  fireEvent.keyDown(root, { key: "f" });

  expect(stub.requested).toEqual([root]);
});

it("answers while the animation is the thing filling the screen, wherever focus went", () => {
  stub = installFullscreenStub();
  const root = renderBar();
  flushLoad();
  act(() => {
    stub?.grant(root);
  });

  /*
   * A key genuinely arrives with a target outside the animation here: the
   * picture is not focusable, so clicking it leaves focus on the body, measured
   * in Chromium, and that is the state a person is most likely to be in once
   * the animation fills the screen. A gate that only asked whether focus was
   * inside would be dead in the one place a keyboard is all anyone has.
   */
  fireEvent.keyDown(document.body, { key: "k" });

  expect(label()).toBe("Pause");
});

it("ignores keys that landed somewhere else on the page", () => {
  renderBar();
  flushLoad();
  const outside = document.createElement("div");
  document.body.appendChild(outside);

  const prevented = !fireEvent.keyDown(outside, { key: "k" });

  expect(label()).toBe("Play");
  /* Left alone entirely, rather than swallowed and ignored. */
  expect(prevented).toBe(false);
  outside.remove();
});

it("leaves typing alone, inside the animation or not", () => {
  renderBar();
  flushLoad();

  fireEvent.keyDown(caption(), { key: "k" });
  expect(label()).toBe("Play");

  /* The picker too: letters there are someone looking for an option. */
  const before = find(lottieLoopClass).getAttribute("aria-pressed");
  fireEvent.keyDown(find("lottie-speed"), { key: "l" });
  expect(find(lottieLoopClass).getAttribute("aria-pressed")).toBe(before);
});

it("leaves a key alone when the browser or the system owns it", () => {
  const root = renderBar();
  flushLoad();

  fireEvent.keyDown(root, { key: "k", metaKey: true });
  fireEvent.keyDown(root, { key: "k", ctrlKey: true });
  fireEvent.keyDown(root, { key: "k", altKey: true });
  /* Held down, which would otherwise toggle at the repeat rate. */
  fireEvent.keyDown(root, { key: "k", repeat: true });
  /* Nothing here answers to it. */
  fireEvent.keyDown(root, { key: "x" });

  expect(label()).toBe("Play");
});

it("is as disabled as the controls are while nothing has loaded", () => {
  const root = renderBar("");
  fireEvent.keyDown(root, { key: "k" });
  expect(label()).toBe("Play");

  /* And after a load that failed, which is the other state an overlay covers. */
  flushLoad();
  fireEvent.keyDown(root, { key: "k" });
  expect(label()).toBe("Play");
});

it("stops listening with the bar it belongs to", () => {
  const view = render(
    <Lottie src={ANIMATION} data-testid="root">
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();
  const root = find("lottie-root");

  view.rerender(
    <Lottie src={ANIMATION} data-testid="root">
      <LottieDisplay />
    </Lottie>,
  );

  /* A page that renders no controls carries no listener of ours. */
  const prevented = !fireEvent.keyDown(root, { key: "k" });
  expect(prevented).toBe(false);
});
