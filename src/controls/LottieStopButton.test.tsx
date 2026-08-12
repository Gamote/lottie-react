import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { type LottieInstance, LottieState } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import { LottieStopButton, lottieStopClass } from "./LottieStopButton.js";

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
      <LottieStopButton lottie={lottie} />
    </div>
  );
}

function button(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(
    `.${lottieStopClass}`,
  );
  if (element === null) {
    throw new Error("no stop button was rendered");
  }
  return element;
}

it("returns the animation to the first frame and leaves it there", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().seek(20);
  });
  expect(instance().animationItem?.currentFrame).toBe(20);

  fireEvent.click(button());

  /* Stopping is not pausing: it rewinds, which is what makes it worth having. */
  expect(instance().animationItem?.currentFrame).toBe(0);
  expect(instance().state).toBe(LottieState.stopped);
});

it("names itself, in the label and in the tooltip", () => {
  render(<Probe />);

  expect(button().getAttribute("aria-label")).toBe("Stop");
  expect(button().title).toBe("Stop");
  expect(button().type).toBe("button");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieStopButton lottie={lottie} className="mine" disabled />;
  }
  render(<Mine />);

  expect(button().getAttribute("class")).toBe(`${lottieStopClass} mine`);
  expect(button().disabled).toBe(true);
});
