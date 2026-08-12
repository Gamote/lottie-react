import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import type { LottieInstance } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import { LottieSpeedSelect, lottieSpeedClass } from "./LottieSpeedSelect.js";

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

function Probe({ speed }: { speed?: number }) {
  const lottie = useLottie({ src: ANIMATION, speed });
  latest = lottie;
  return (
    <div>
      <LottieDisplay lottie={lottie} />
      <LottieSpeedSelect lottie={lottie} />
    </div>
  );
}

function select(): HTMLSelectElement {
  const element = document.querySelector<HTMLSelectElement>(
    `.${lottieSpeedClass}`,
  );
  if (element === null) {
    throw new Error("no speed picker was rendered");
  }
  return element;
}

it("is one native control, not a menu of buttons", () => {
  render(<Probe />);
  flushLoad();

  /*
   * The custom dropdown this replaces left its seven option buttons in the
   * document when closed, hidden only by opacity, so every animation on a page
   * added seven tab stops nobody could see.
   */
  expect(select().tagName).toBe("SELECT");
  expect(document.querySelectorAll(`.${lottieSpeedClass} option`)).toHaveLength(
    7,
  );
  expect(select().getAttribute("aria-label")).toBe("Playback speed");
});

it("shows the rate the animation is playing at", () => {
  render(<Probe speed={0.5} />);
  flushLoad();

  expect(select().value).toBe("0.5");
});

it("changes the rate", () => {
  render(<Probe />);
  flushLoad();

  fireEvent.change(select(), { target: { value: "2" } });

  expect(instance().speed).toBe(2);
  expect(select().value).toBe("2");
});

it("offers a rate that came from somewhere else rather than ignoring it", () => {
  render(<Probe />);
  flushLoad();

  act(() => {
    instance().setSpeed(1.7);
  });

  /*
   * A rate set by a prop or by `setSpeed` need not be one of the seven offered.
   * Without adding it the control would sit blank or, worse, report a rate the
   * animation is not playing at.
   */
  expect(select().value).toBe("1.7");
  expect(document.querySelectorAll(`.${lottieSpeedClass} option`)).toHaveLength(
    8,
  );
  expect(
    [...document.querySelectorAll(`.${lottieSpeedClass} option`)].map(
      (option) => option.textContent,
    ),
  ).toEqual(["0.25x", "0.5x", "0.75x", "1x", "1.25x", "1.5x", "1.7x", "2x"]);
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieSpeedSelect lottie={lottie} className="mine" disabled />;
  }
  render(<Mine />);

  expect(select().getAttribute("class")).toBe(`${lottieSpeedClass} mine`);
  expect(select().disabled).toBe(true);
});
