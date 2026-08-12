import { act, cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import type { LottieInstance } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import {
  LottieReadout,
  type LottieReadoutUnit,
  lottieReadoutClass,
} from "./LottieReadout.js";

/** Thirty frames at thirty a second, so the animation lasts exactly one second. */
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

function Probe({ unit }: { unit?: LottieReadoutUnit }) {
  const lottie = useLottie({ src: ANIMATION });
  latest = lottie;
  return (
    <div>
      <LottieDisplay lottie={lottie} />
      <LottieReadout lottie={lottie} unit={unit} />
    </div>
  );
}

function readout(): HTMLElement {
  const element = document.querySelector<HTMLElement>(`.${lottieReadoutClass}`);
  if (element === null) {
    throw new Error("no readout was rendered");
  }
  return element;
}

it("counts in frames unless it is told otherwise", () => {
  render(<Probe />);
  flushLoad();

  /*
   * Twenty nine, not thirty. The total is the last frame rather than the count
   * of them, so the number below it can actually reach it and the readout can
   * read as finished, and so that it agrees with the seek bar's own maximum.
   */
  expect(readout().textContent).toBe("0 / 29");

  act(() => {
    instance().seek(12);
  });

  expect(readout().textContent).toBe("12 / 29");
});

it("counts in seconds when asked, to one decimal", () => {
  render(<Probe unit="seconds" />);
  flushLoad();

  expect(readout().textContent).toBe("0.0s / 1.0s");

  act(() => {
    instance().seek(15);
  });

  /*
   * One decimal rather than the `0:00` a video player uses. Most animations run
   * for a few seconds, so minutes are always zero and the tenths are the only
   * digits that move.
   */
  expect(readout().textContent).toBe("0.5s / 1.0s");
});

it("shows zeros while there is nothing loaded, in either unit", () => {
  const view = render(<Probe />);
  expect(readout().textContent).toBe("0 / 0");

  cleanup();
  view.unmount();
  render(<Probe unit="seconds" />);
  expect(readout().textContent).toBe("0.0s / 0.0s");
});

it("redraws where it already is when the unit changes", () => {
  const view = render(<Probe />);
  flushLoad();
  act(() => {
    instance().seek(15);
  });
  expect(readout().textContent).toBe("15 / 29");

  view.rerender(<Probe unit="seconds" />);

  /*
   * Rewritten on the way in as well as on every frame. Waiting for the next
   * frame event would leave a paused animation reading zero in the new unit
   * until something moved it, which for a stopped animation is never.
   */
  expect(readout().textContent).toBe("0.5s / 1.0s");
});

it("is an output element, so it is not a tab stop", () => {
  render(<Probe />);
  flushLoad();

  expect(readout().tagName).toBe("OUTPUT");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieReadout lottie={lottie} className="mine" />;
  }
  render(<Mine />);

  expect(readout().getAttribute("class")).toBe(`${lottieReadoutClass} mine`);
});

it("puts every other attribute on the element", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <LottieReadout lottie={lottie} id="position" aria-label="position" />
    );
  }
  render(<Mine />);

  expect(readout().id).toBe("position");
  expect(readout().getAttribute("aria-label")).toBe("position");
});
