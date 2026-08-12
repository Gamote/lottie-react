import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import type { LottieInstance } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import { LottieLoopButton, lottieLoopClass } from "./LottieLoopButton.js";

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

const toggle = vi.fn();

function Probe({ loop }: { loop?: boolean | number }) {
  const lottie = useLottie({ src: ANIMATION, loop });
  latest = lottie;
  return (
    <div>
      <LottieDisplay lottie={lottie} />
      <LottieLoopButton lottie={lottie} toggle={toggle} />
    </div>
  );
}

function button(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(
    `.${lottieLoopClass}`,
  );
  if (element === null) {
    throw new Error("no loop button was rendered");
  }
  return element;
}

it("carries whether looping is on as a pressed state, not as a colour", () => {
  render(<Probe loop />);
  flushLoad();

  expect(button().getAttribute("aria-label")).toBe("Loop");
  expect(button().getAttribute("aria-pressed")).toBe("true");
  expect(instance().loop).toBe(true);
});

it("reports looping as off when it is", () => {
  render(<Probe loop={false} />);
  flushLoad();

  expect(button().getAttribute("aria-pressed")).toBe("false");
});

it("hands the switching over rather than doing it", () => {
  render(<Probe loop={3} />);
  flushLoad();

  fireEvent.click(button());

  /*
   * The count in force has to survive being switched off and on again, and the
   * `l` shortcut does the same switching, so the memory of it belongs to the one
   * thing that owns both. Two memories mean `loop={3}` becomes `loop={true}` the
   * moment someone uses the key and then the button.
   */
  expect(toggle).toHaveBeenCalledTimes(1);
  expect(instance().loop).toBe(3);
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <LottieLoopButton
        lottie={lottie}
        toggle={toggle}
        className="mine"
        disabled
      />
    );
  }
  render(<Mine />);

  expect(button().getAttribute("class")).toBe(`${lottieLoopClass} mine`);
  expect(button().disabled).toBe(true);
  expect(button().type).toBe("button");
});
