import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { type LottieInstance, LottieState } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import { LottiePlayButton, lottiePlayClass } from "./LottiePlayButton.js";

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

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  vi.restoreAllMocks();
});

function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

let latest: LottieInstance | null = null;
function instance(): LottieInstance {
  if (latest === null) {
    throw new Error("nothing has rendered the animation yet");
  }
  return latest;
}

function Probe() {
  const lottie = useLottie({ src: ANIMATION });
  latest = lottie;
  return (
    <div>
      <LottieDisplay lottie={lottie} />
      <LottiePlayButton lottie={lottie} />
    </div>
  );
}

function button(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(
    `.${lottiePlayClass}`,
  );
  if (element === null) {
    throw new Error("no play button was rendered");
  }
  return element;
}

it("starts the animation, and says what it will do next", () => {
  render(<Probe />);
  flushLoad();

  expect(button().getAttribute("aria-label")).toBe("Play");
  expect(button().title).toBe("Play");

  fireEvent.click(button());

  expect(instance().state).toBe(LottieState.playing);
  expect(button().getAttribute("aria-label")).toBe("Pause");
});

it("stops the animation where it is", () => {
  render(<Probe />);
  flushLoad();
  fireEvent.click(button());

  fireEvent.click(button());

  expect(instance().state).toBe(LottieState.paused);
  expect(button().getAttribute("aria-label")).toBe("Play");
});

it("is one element, so pressing it does not throw focus away", () => {
  render(<Probe />);
  flushLoad();

  button().focus();
  expect(document.activeElement).toBe(button());

  fireEvent.click(button());

  /*
   * The player this replaces rendered play and pause as two components in two
   * positions, so toggling unmounted whichever one had focus and dropped it to
   * the document body. One element that changes its label cannot do that.
   */
  expect(document.activeElement).toBe(button());
});

it("is a button that never submits a form", () => {
  render(<Probe />);

  expect(button().type).toBe("button");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottiePlayButton lottie={lottie} className="mine" />;
  }
  render(<Mine />);

  expect(button().getAttribute("class")).toBe(`${lottiePlayClass} mine`);
});

it("takes a label of the consumer's, which is what translating it needs", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottiePlayButton lottie={lottie} aria-label="Lecture" disabled />;
  }
  render(<Mine />);

  expect(button().getAttribute("aria-label")).toBe("Lecture");
  expect(button().disabled).toBe(true);
});
