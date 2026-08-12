import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { LottieDirection, type LottieInstance } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import {
  LottieDirectionButton,
  lottieDirectionClass,
} from "./LottieDirectionButton.js";

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
      <LottieDirectionButton lottie={lottie} />
    </div>
  );
}

function button(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(
    `.${lottieDirectionClass}`,
  );
  if (element === null) {
    throw new Error("no direction button was rendered");
  }
  return element;
}

it("names the control and reports its setting, rather than naming the action", () => {
  render(<Probe />);
  flushLoad();

  /*
   * The old player put the next action in the label and the current setting in
   * the icon, so neither told you what was true now. A pressed state says which
   * of the two the label refers to.
   */
  expect(button().getAttribute("aria-label")).toBe("Play in reverse");
  expect(button().getAttribute("aria-pressed")).toBe("false");
});

it("turns the animation around, and back again", () => {
  render(<Probe />);
  flushLoad();

  fireEvent.click(button());

  expect(instance().direction).toBe(LottieDirection.reverse);
  expect(button().getAttribute("aria-pressed")).toBe("true");

  fireEvent.click(button());

  expect(instance().direction).toBe(LottieDirection.forward);
  expect(button().getAttribute("aria-pressed")).toBe("false");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDirectionButton lottie={lottie} className="mine" disabled />;
  }
  render(<Mine />);

  expect(button().getAttribute("class")).toBe(`${lottieDirectionClass} mine`);
  expect(button().disabled).toBe(true);
  expect(button().type).toBe("button");
});
