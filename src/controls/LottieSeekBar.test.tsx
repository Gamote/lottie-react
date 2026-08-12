import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { type LottieInstance, LottieState } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import { LottieSeekBar, lottieSeekClass } from "./LottieSeekBar.js";

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

/** lottie-web announces a finished load on a macrotask rather than inline. */
function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

/*
 * Read through a getter rather than captured, because the animation is a new
 * object on every render and a copy taken once goes stale immediately.
 */
let latest: LottieInstance | null = null;
function instance(): LottieInstance {
  if (latest === null) {
    throw new Error("nothing has rendered the animation yet");
  }
  return latest;
}

function Probe({ withBar = true }: { withBar?: boolean }) {
  const lottie = useLottie({ src: ANIMATION });
  latest = lottie;
  return (
    <div>
      <LottieDisplay lottie={lottie} />
      {withBar ? <LottieSeekBar lottie={lottie} /> : null}
    </div>
  );
}

function bar(): HTMLInputElement {
  const element = document.querySelector<HTMLInputElement>(
    `.${lottieSeekClass}`,
  );
  if (element === null) {
    throw new Error("no seek bar was rendered");
  }
  return element;
}

it("is a range over the playable frames, one frame to a step", () => {
  render(<Probe />);
  flushLoad();

  const element = bar();
  expect(element.type).toBe("range");
  expect(element.min).toBe("0");
  /* One less than the count: the frames of a 30 frame animation are 0 to 29. */
  expect(element.max).toBe("29");
  /*
   * No stepping, so the thumb can sit exactly where the animation is rather
   * than on one of `playableFrames` positions. Measured in Chromium: with a step
   * of one frame the element rounds a written 12.503 to 13, which is what made
   * the thumb move in jumps while the engine reported half-frames.
   */
  expect(element.step).toBe("any");
  expect(element.getAttribute("aria-label")).toBe("Seek");
});

it("moves exactly one frame per arrow press, in both directions", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().seek(12);
  });

  fireEvent.keyDown(bar(), { key: "ArrowRight" });
  expect(instance().animationItem?.currentFrame).toBe(13);

  fireEvent.keyDown(bar(), { key: "ArrowLeft" });
  expect(instance().animationItem?.currentFrame).toBe(12);

  /* Up and down are the same axis on a slider, so they do the same thing. */
  fireEvent.keyDown(bar(), { key: "ArrowUp" });
  expect(instance().animationItem?.currentFrame).toBe(13);
  fireEvent.keyDown(bar(), { key: "ArrowDown" });
  expect(instance().animationItem?.currentFrame).toBe(12);
});

it("steps to the next whole frame from between two", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().seek(12.5);
  });

  fireEvent.keyDown(bar(), { key: "ArrowRight" });

  /* The frame ahead, not 13.5, because the unit a press moves is a frame. */
  expect(instance().animationItem?.currentFrame).toBe(13);
});

it("stops the animation on the first arrow press", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().play();
  });
  expect(instance().state).toBe(LottieState.playing);

  fireEvent.keyDown(bar(), { key: "ArrowRight" });

  /*
   * Stepping a frame at a time is meaningless against playback, which covers
   * half a frame every tick and has overtaken the new position before it can be
   * seen. Measured in a browser before this existed: one press moved the value
   * from 11 to 12 and playback carried it to 14 within 60ms.
   */
  expect(instance().state).toBe(LottieState.paused);
});

it("leaves every other key to the element", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().seek(12);
  });

  fireEvent.keyDown(bar(), { key: "Home" });
  fireEvent.keyDown(bar(), { key: "a" });

  /* Home and End are the element's own and still reach it through onChange. */
  expect(instance().animationItem?.currentFrame).toBe(12);
});

it("writes no aria-valuenow, so the element reports its own position", () => {
  render(<Probe />);
  flushLoad();

  /*
   * A native range derives the value it announces from `value`, which is what
   * this component writes. The old player set `aria-valuenow` to a literal zero
   * and never updated it, so a screen reader was told the position never moved.
   */
  expect(bar().hasAttribute("aria-valuenow")).toBe(false);
});

it("follows the playhead, including while the animation is paused", () => {
  render(<Probe />);
  flushLoad();

  act(() => {
    instance().seek(12);
  });

  expect(bar().value).toBe("12");
  expect(instance().state).not.toBe(LottieState.playing);
});

it("shows where the playhead already is when it mounts late", () => {
  const view = render(<Probe withBar={false} />);
  flushLoad();
  act(() => {
    instance().seek(9);
  });

  view.rerender(<Probe withBar />);

  /*
   * A frame event only says where the playhead is once it next moves, so a bar
   * rendered after the fact has to ask the engine instead.
   */
  expect(bar().value).toBe("9");
});

it("pauses on the way into a drag and restores playback on the way out", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().play();
  });
  expect(instance().state).toBe(LottieState.playing);

  fireEvent.pointerDown(bar());
  expect(instance().state).toBe(LottieState.paused);

  fireEvent.change(bar(), { target: { value: "20" } });
  expect(instance().animationItem?.currentFrame).toBe(20);
  expect(instance().state).toBe(LottieState.paused);

  act(() => {
    fireEvent.pointerUp(window);
  });

  expect(instance().state).toBe(LottieState.playing);
});

it("leaves a paused animation paused when a drag ends", () => {
  render(<Probe />);
  flushLoad();

  fireEvent.pointerDown(bar());
  fireEvent.change(bar(), { target: { value: "5" } });
  act(() => {
    fireEvent.pointerUp(window);
  });

  expect(instance().state).toBe(LottieState.paused);
  expect(instance().animationItem?.currentFrame).toBe(5);
});

it("ends the drag when the pointer is released away from it", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().play();
  });

  fireEvent.pointerDown(bar());
  /*
   * Released over the document rather than the element. Whether a range input
   * keeps the pointer captured to the end of a gesture is a browser behaviour
   * this component deliberately does not rely on.
   */
  act(() => {
    fireEvent.pointerUp(document.body);
  });

  expect(instance().state).toBe(LottieState.playing);
});

it("ends the drag when the browser takes the gesture away", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().play();
  });

  fireEvent.pointerDown(bar());
  act(() => {
    fireEvent.pointerCancel(window);
  });

  expect(instance().state).toBe(LottieState.playing);
});

it("does not fight the pointer for the thumb while a drag is running", () => {
  render(<Probe />);
  flushLoad();

  fireEvent.pointerDown(bar());
  fireEvent.change(bar(), { target: { value: "22" } });
  /* The animation reports frame 22 back, and the value stays where the drag put it. */
  act(() => {
    instance().seek(3);
  });

  expect(bar().value).toBe("22");
});

it("seeks rather than scrubbing when the change came from the keyboard", () => {
  render(<Probe />);
  flushLoad();
  act(() => {
    instance().play();
  });

  /* No pointer went down, so this is a single jump rather than a gesture. */
  fireEvent.change(bar(), { target: { value: "7" } });

  expect(instance().animationItem?.currentFrame).toBe(7);
  /* Seeking leaves playback alone, so an animation being arrowed plays on. */
  expect(instance().state).toBe(LottieState.playing);
});

it("stops listening for the end of a drag when it goes away", () => {
  const remove = vi.spyOn(window, "removeEventListener");
  const view = render(<Probe />);
  flushLoad();

  fireEvent.pointerDown(bar());
  view.unmount();

  const removed = remove.mock.calls.map(([type]) => type);
  expect(removed).toContain("pointerup");
  expect(removed).toContain("pointercancel");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieSeekBar lottie={lottie} className="mine" />;
  }
  render(<Mine />);

  expect(bar().getAttribute("class")).toBe(`${lottieSeekClass} mine`);
});

it("puts every other attribute on the element", () => {
  function Mine() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieSeekBar lottie={lottie} disabled id="scrubber" />;
  }
  render(<Mine />);

  expect(bar().disabled).toBe(true);
  expect(bar().id).toBe("scrubber");
});
