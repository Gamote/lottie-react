import { act, cleanup, render } from "@testing-library/react";
import lottie from "lottie-web";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import {
  LottieDirection,
  type LottieInstance,
  LottieState,
  LottieSubscription,
} from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

/** 60 frames at 30fps, so two seconds and a `playableFrames` worth asserting. */
const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

/**
 * The same animation with markers on it: `middle` labels a position, `chapter`
 * labels a span running from frame 10 to frame 30.
 */
const WITH_MARKERS = {
  ...ANIMATION,
  markers: [
    { tm: 30, cm: "middle", dr: 0 },
    { tm: 10, cm: "chapter", dr: 20 },
  ],
};

/*
 * The clock is installed once for the whole file rather than per test, because
 * lottie-web's render loop is global to the module and remembers whether it is
 * running. Swapping the clock underneath it discards the frame it had queued,
 * and since nothing then tells it to start again, every animation loaded
 * afterwards sits still. Every test in this file would pass on its own.
 */
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

afterEach(() => {
  /*
   * Unmount first, so the animations are destroyed, and then let the loop run
   * far enough to notice that nothing is playing and park itself. Leaving it
   * spinning would carry the previous test's frames into the next one.
   */
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  vi.restoreAllMocks();
});

interface Harness {
  instance: LottieInstance;
  rerender: (options: UseLottieOptions) => void;
  unmount: () => void;
}

/**
 * Renders the hook inside a real component with a real display element, because the
 * animation only exists once an element is attached.
 */
function setup(
  options: UseLottieOptions,
  { strict = false }: { strict?: boolean } = {},
): Harness {
  let latest: LottieInstance | undefined;

  function Probe(props: UseLottieOptions) {
    const instance = useLottieAnimation(lottie, props);
    latest = instance;
    return <div ref={instance.setDisplayRef} />;
  }

  const view = render(<Probe {...options} />, { reactStrictMode: strict });

  return {
    /* A getter, so each read sees the latest render. Destructuring it
       captures one render and silently stops tracking. */
    get instance() {
      if (latest === undefined) {
        throw new Error("the probe never rendered");
      }
      return latest;
    },
    rerender: (next) => {
      view.rerender(<Probe {...next} />);
    },
    unmount: view.unmount,
  };
}

/** lottie-web announces a finished load on a macrotask rather than inline. */
function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

/** Drives the engine's own render loop by the given number of milliseconds. */
function advance(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

it("starts in the loading state, before any display exists", () => {
  const harness = setup({ src: ANIMATION });
  expect(harness.instance.state).toBe(LottieState.loading);
});

it("loads once a display is attached and reports what it loaded", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  expect(harness.instance.animationItem).not.toBeNull();
  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(harness.instance.playableFrames).toBe(60);
  expect(harness.instance.playableDuration).toBe(2);
});

it("renders the animation it was handed rather than a fixed element", () => {
  const harness = setup({ src: { ...ANIMATION, w: 123, h: 45 } });
  flushLoad();

  expect(
    harness.instance.animationItem?.renderer.svgElement.getAttribute("viewBox"),
  ).toBe("0 0 123 45");
});

it("accepts a path, and stays loading until the fetch resolves", () => {
  /*
   * The request is stopped at the door. Left alone, the engine really does open
   * an XHR against the environment's origin, so the suite would depend on what
   * happens to be listening on that port, and a response arriving after the
   * file's DOM is gone fails the run with an unhandled `document is not
   * defined` rather than as a test.
   */
  const send = vi
    .spyOn(XMLHttpRequest.prototype, "send")
    .mockImplementation(() => undefined);

  const harness = setup({ src: "  /animations/hero.json " });
  flushLoad();

  expect(send).toHaveBeenCalledTimes(1);
  expect(harness.instance.state).toBe(LottieState.loading);
});

/*
 * `import * as data from "./animation.json"` yields a frozen namespace
 * under Node's own JSON modules, and lottie-web writes `__complete` onto
 * whatever it is handed, so without a copy the load throws.
 */
it("loads from a frozen source, which the engine cannot write to", () => {
  const harness = setup({ src: Object.freeze({ ...ANIMATION }) });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(harness.instance.animationItem).not.toBeNull();
});

/*
 * An identity that changed between renders would re-fire every effect that
 * depends on it, forever.
 */
it("keeps setDisplayRef's identity across renders", () => {
  const harness = setup({ src: ANIMATION });
  const first = harness.instance.setDisplayRef;
  flushLoad();
  harness.rerender({ src: ANIMATION, speed: 2 });

  expect(harness.instance.setDisplayRef).toBe(first);
});

/*
 * An object written inline at the call site is a new object every render.
 * Depending on it by reference would tear the animation down and rebuild it,
 * and on the hook path our own state update is the caller's re-render, so it
 * would never settle.
 */
it("does not reload when an inline src is re-created with the same content", () => {
  const harness = setup({ src: { ...ANIMATION } });
  flushLoad();
  const loaded = harness.instance.animationItem;

  harness.rerender({ src: { ...ANIMATION } });
  harness.rerender({ src: { ...ANIMATION } });
  flushLoad();

  expect(harness.instance.animationItem).toBe(loaded);
});

it("does reload when the src content actually changes", () => {
  const harness = setup({ src: { ...ANIMATION } });
  flushLoad();
  const loaded = harness.instance.animationItem;

  harness.rerender({ src: { ...ANIMATION, op: 90 } });
  flushLoad();

  expect(harness.instance.animationItem).not.toBe(loaded);
  expect(harness.instance.playableFrames).toBe(90);
});

it("does not reload when only a reactive prop changes", () => {
  const harness = setup({ src: ANIMATION, speed: 1 });
  flushLoad();
  const loaded = harness.instance.animationItem;

  harness.rerender({ src: ANIMATION, speed: 2 });
  flushLoad();

  expect(harness.instance.animationItem).toBe(loaded);
});

it("reports a failure, with the reason, when src is not usable", () => {
  const failed = vi.fn();
  const harness = setup({ src: "", subscriptions: { error: failed } });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.error);
  expect(failed).toHaveBeenCalledOnce();
  expect(failed.mock.calls[0]?.[0].error).toBeInstanceOf(Error);
  expect(failed.mock.calls[0]?.[0].error.message).toContain("`src` must be");
});

it("reports a failure, with the engine's own error, when the load throws", () => {
  const failed = vi.fn();
  const harness = setup({
    src: { nonsense: true },
    subscriptions: { error: failed },
  });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.error);
  expect(failed).toHaveBeenCalledOnce();
  expect(failed.mock.calls[0]?.[0].error).toBeInstanceOf(TypeError);
});

/*
 * The reason has to be readable and not only announced, because the event fires
 * once and anything that mounts afterwards, an overlay among them, would
 * otherwise have no way to learn why.
 */
it("keeps the reason, for anything that was not listening at the time", () => {
  const harness = setup({ src: "" });
  flushLoad();

  expect(harness.instance.error).toBeInstanceOf(Error);
  expect(harness.instance.error?.message).toContain("`src` must be");
});

it("carries no reason while nothing has failed", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(harness.instance.error).toBeNull();
});

/*
 * A source is only loaded again when its content changes, which is what keeps
 * an unrelated render from restarting the animation. The consequence is that a
 * failed load cannot be retried by handing the same path back, so retrying is
 * something the animation has to offer.
 */
it("loads again when asked, for a source it has already seen", () => {
  const failed = vi.fn();
  const harness = setup({ src: "", subscriptions: { error: failed } });
  flushLoad();
  expect(failed).toHaveBeenCalledOnce();

  act(() => {
    harness.instance.reload();
  });
  flushLoad();

  expect(failed).toHaveBeenCalledTimes(2);
});

it("does not load again on its own, however much the consumer renders", () => {
  const failed = vi.fn();
  const harness = setup({ src: "", subscriptions: { error: failed } });
  flushLoad();

  harness.rerender({ src: "", subscriptions: { error: failed } });
  harness.rerender({ src: "", subscriptions: { error: failed } });
  flushLoad();

  expect(failed).toHaveBeenCalledOnce();
});

it("builds the animation again when a loaded one is reloaded", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();
  const first = harness.instance.animationItem;

  act(() => {
    harness.instance.reload();
  });
  flushLoad();

  expect(harness.instance.animationItem).not.toBe(first);
  expect(harness.instance.state).toBe(LottieState.stopped);
});

it("forgets the reason when a new source starts loading", () => {
  const harness = setup({ src: "" });
  flushLoad();
  expect(harness.instance.error).not.toBeNull();

  harness.rerender({ src: ANIMATION });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(harness.instance.error).toBeNull();
});

/*
 * Notifying `play`, `pause` and `stop` only from the matching method would
 * leave autoplay, completion and every segment end invisible, with `newState`
 * as the only signal telling the truth.
 */
it("notifies play for autoplay, which no method call announced", () => {
  const play = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    subscriptions: { play },
  });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.playing);
  expect(play).toHaveBeenCalledOnce();
});

it("notifies stop when the animation reaches its end on its own", () => {
  const stop = vi.fn();
  const complete = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    subscriptions: { stop, complete },
  });
  flushLoad();
  advance(3000);

  expect(complete).toHaveBeenCalledOnce();
  expect(stop).toHaveBeenCalledOnce();
  expect(harness.instance.state).toBe(LottieState.stopped);
});

it("leaves a finished animation on its last frame rather than rewinding it", () => {
  const harness = setup({ src: ANIMATION, autoplay: true });
  flushLoad();
  advance(3000);

  expect(harness.instance.animationItem?.currentFrame).toBe(59);
});

it("notifies loopCompleted at a loop boundary without claiming it stopped", () => {
  const loopCompleted = vi.fn();
  const stop = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    loop: true,
    subscriptions: { loopCompleted, stop },
  });
  flushLoad();
  advance(2100);

  expect(loopCompleted).toHaveBeenCalled();
  expect(stop).not.toHaveBeenCalled();
  expect(harness.instance.state).toBe(LottieState.playing);
});

/*
 * The five-second warning: an animation that starts by itself and moves for
 * longer than five seconds needs a pause affordance (WCAG 2.2.2). The fixture
 * runs two seconds, so looping forever crosses the line, two repeats (six
 * seconds) cross it, and one repeat (four seconds) does not.
 */
it("warns when an autoplaying animation moves for more than five seconds", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  setup({ src: ANIMATION, autoplay: true, loop: true });
  flushLoad();

  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("five seconds");
  expect(warn.mock.calls[0]?.[0]).toContain("LottieControls");
});

it("counts the repeats a numeric loop adds to the running time", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  setup({ src: ANIMATION, autoplay: true, loop: 2 });
  flushLoad();

  expect(warn).toHaveBeenCalledOnce();
});

it("stays quiet when the whole run fits inside five seconds", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  setup({ src: ANIMATION, autoplay: true, loop: 1 });
  flushLoad();

  expect(warn).not.toHaveBeenCalled();
});

it("stays quiet about five seconds when nothing starts by itself", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  setup({ src: ANIMATION, loop: true });
  flushLoad();

  expect(warn).not.toHaveBeenCalled();
});

it("notifies ready once the animation data has been read", () => {
  const ready = vi.fn();
  setup({ src: ANIMATION, subscriptions: { ready } });
  flushLoad();

  expect(ready).toHaveBeenCalledOnce();
});

it("notifies frame as the animation advances, with the current frame", () => {
  const frame = vi.fn();
  setup({ src: ANIMATION, autoplay: true, subscriptions: { frame } });
  flushLoad();
  advance(500);

  expect(frame).toHaveBeenCalled();
  const last = frame.mock.calls.at(-1)?.[0];
  expect(last?.currentFrame).toBeGreaterThan(0);
});

/** The names a marker spy saw, in the order it saw them. */
function markerNames(spy: ReturnType<typeof vi.fn>): string[] {
  return spy.mock.calls.map(([event]) => (event as { marker: string }).marker);
}

it("announces each marker playback passes, in the order passed", () => {
  const marker = vi.fn();
  setup({ src: WITH_MARKERS, autoplay: true, subscriptions: { marker } });
  flushLoad();
  advance(1200);

  expect(markerNames(marker)).toEqual(["chapter", "middle"]);
});

it("announces markers against the range a segment leaves playable", () => {
  const marker = vi.fn();
  const harness = setup({ src: WITH_MARKERS, subscriptions: { marker } });
  flushLoad();

  act(() => {
    harness.instance.playSegments([20, 40]);
  });
  advance(700);

  /* `middle` sits at file frame 30, which is range frame 10 here; `chapter`
     sits at file frame 10, before the range, and must never fire. */
  expect(markerNames(marker)).toEqual(["middle"]);
});

/*
 * The two jump tests play a little first, so the crossing memory holds a real
 * position when the jump happens. Jumping from nowhere announces nothing
 * whatever the code does, which is a test that cannot fail.
 */
it("does not announce markers a seek jumps across", () => {
  const marker = vi.fn();
  const harness = setup({
    src: WITH_MARKERS,
    autoplay: true,
    subscriptions: { marker },
  });
  flushLoad();
  advance(200);
  expect(marker).not.toHaveBeenCalled();

  act(() => {
    harness.instance.seek(50);
  });
  advance(200);

  expect(marker).not.toHaveBeenCalled();
});

it("does not announce markers a scrub drags across", () => {
  const marker = vi.fn();
  const harness = setup({
    src: WITH_MARKERS,
    autoplay: true,
    subscriptions: { marker },
  });
  flushLoad();
  advance(200);

  act(() => {
    harness.instance.scrubStart();
    harness.instance.scrubTo(50);
    harness.instance.scrubEnd();
  });
  advance(200);

  expect(marker).not.toHaveBeenCalled();
});

it("announces markers in the order met when playing backwards", () => {
  const marker = vi.fn();
  const harness = setup({
    src: WITH_MARKERS,
    direction: LottieDirection.reverse,
    subscriptions: { marker },
  });
  flushLoad();

  act(() => {
    harness.instance.seek(50);
    harness.instance.play();
  });
  advance(1800);

  expect(markerNames(marker)).toEqual(["middle", "chapter"]);
});

it("announces markers again on every pass of a loop", () => {
  const marker = vi.fn();
  setup({
    src: WITH_MARKERS,
    autoplay: true,
    loop: true,
    subscriptions: { marker },
  });
  flushLoad();
  advance(4200);

  expect(markerNames(marker).slice(0, 4)).toEqual([
    "chapter",
    "middle",
    "chapter",
    "middle",
  ]);
});

it("announces markers on every pass of a reverse loop too", () => {
  const marker = vi.fn();
  const harness = setup({
    src: WITH_MARKERS,
    direction: LottieDirection.reverse,
    loop: true,
    subscriptions: { marker },
  });
  flushLoad();

  /* At frame 0 a reverse play has nowhere to go, so it restarts from the end. */
  act(() => {
    harness.instance.play();
  });
  advance(4200);

  expect(markerNames(marker).slice(0, 4)).toEqual([
    "middle",
    "chapter",
    "middle",
    "chapter",
  ]);
});

it("announces markers afresh after stop returns to the start", () => {
  const marker = vi.fn();
  const harness = setup({
    src: WITH_MARKERS,
    autoplay: true,
    subscriptions: { marker },
  });
  flushLoad();
  advance(1200);

  act(() => {
    harness.instance.stop();
    harness.instance.play();
  });
  advance(1200);

  expect(markerNames(marker)).toEqual([
    "chapter",
    "middle",
    "chapter",
    "middle",
  ]);
});

it("play, pause and stop move the state and announce themselves", () => {
  const play = vi.fn();
  const pause = vi.fn();
  const stop = vi.fn();
  const harness = setup({
    src: ANIMATION,
    subscriptions: { play, pause, stop },
  });
  flushLoad();

  act(() => {
    harness.instance.play();
  });
  expect(harness.instance.state).toBe(LottieState.playing);

  act(() => {
    harness.instance.pause();
  });
  expect(harness.instance.state).toBe(LottieState.paused);

  act(() => {
    harness.instance.stop();
  });
  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(harness.instance.animationItem?.currentFrame).toBe(0);

  expect(play).toHaveBeenCalledOnce();
  expect(pause).toHaveBeenCalledOnce();
  expect(stop).toHaveBeenCalledOnce();
});

it("does nothing, rather than throwing, while there is no display", () => {
  let latest: LottieInstance | undefined;

  function Unattached() {
    latest = useLottieAnimation(lottie, { src: ANIMATION });
    // Deliberately never given `setDisplayRef`, so nothing is ever loaded.
    return <div />;
  }

  render(<Unattached />);
  flushLoad();

  expect(latest?.animationItem).toBeNull();
  expect(() => {
    act(() => {
      latest?.play();
      latest?.pause();
      latest?.stop();
      latest?.setSpeed(2);
      latest?.setDirection(LottieDirection.reverse);
      latest?.setLoop(true);
      latest?.seek(30);
      latest?.scrubStart();
      latest?.scrubTo(10);
      latest?.scrubEnd();
      latest?.playSegments([0, 30]);
      latest?.resetSegments();
    });
  }).not.toThrow();
  expect(latest?.state).toBe(LottieState.loading);
  // The values still move, so the animation is driven correctly once it loads.
  expect(latest?.speed).toBe(2);
  expect(latest?.direction).toBe(LottieDirection.reverse);
});

/*
 * The engine reports a source it could not fetch as `data_failed`, carrying no
 * payload, so we have to supply the reason ourselves. It is raised through the
 * engine's own `triggerEvent` rather than by requesting a missing file, because
 * that path needs a real network round trip and this file runs on a fake clock.
 * The link between a failed fetch and this event belongs to lottie-web, and the
 * contract tier is where facts about lottie-web are asserted.
 */
it("reports a failure, with a reason of our own, when the engine gives none", () => {
  const failed = vi.fn();
  const harness = setup({ src: ANIMATION, subscriptions: { error: failed } });
  flushLoad();

  act(() => {
    harness.instance.animationItem?.triggerEvent("data_failed", undefined);
  });

  expect(harness.instance.state).toBe(LottieState.error);
  expect(failed).toHaveBeenCalledOnce();
  expect(failed.mock.calls[0]?.[0].error.message).toContain(
    "could not be loaded",
  );
});

it("plays in reverse from the first frame, which the engine refuses to do", () => {
  const harness = setup({ src: ANIMATION, direction: LottieDirection.reverse });
  flushLoad();

  act(() => {
    harness.instance.play();
  });
  advance(200);

  expect(harness.instance.animationItem?.currentFrame).toBeGreaterThan(0);
  expect(harness.instance.animationItem?.isPaused).toBe(false);
});

/*
 * A direction applied in the same commit reaches the engine at once and the
 * mirrored value only on the next render, so play() takes its bearings from
 * the engine: read from the mirror instead, a reversed restart leaves from
 * frame 0 and the engine completes it on the spot.
 */
it("plays a finished animation in a direction set in the same breath", () => {
  const harness = setup({ src: ANIMATION, autoplay: true });
  flushLoad();
  advance(3000);
  expect(harness.instance.animationItem?.currentFrame).toBe(59);

  act(() => {
    harness.instance.setDirection(LottieDirection.reverse);
    harness.instance.play();
  });
  advance(200);

  expect(harness.instance.state).toBe(LottieState.playing);
  expect(harness.instance.animationItem?.isPaused).toBe(false);
  const frame = harness.instance.animationItem?.currentFrame ?? Number.NaN;
  expect(frame).toBeGreaterThan(0);
  expect(frame).toBeLessThan(59);
});

/*
 * The engine's pass counter is a running total that only stop and segment
 * changes reset, and completion compares it to `loop` with strict equality.
 * These three pin our compensation: a loop change and a restart each grant
 * the stated number of repeats, whatever the counter had accumulated.
 */
it("completes a numeric loop set while an endless loop had been running", () => {
  const complete = vi.fn();
  const loopCompleted = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    loop: true,
    subscriptions: { complete, loopCompleted },
  });
  flushLoad();
  advance(10400);

  const before = loopCompleted.mock.calls.length;
  act(() => {
    harness.instance.setLoop(2);
  });
  advance(6400);

  expect(complete).toHaveBeenCalledOnce();
  expect(loopCompleted.mock.calls.length - before).toBe(2);
});

it("plays the whole loop budget again when a finished animation restarts", () => {
  const loopCompleted = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    loop: 2,
    subscriptions: { loopCompleted },
  });
  flushLoad();
  advance(6400);
  const firstRun = loopCompleted.mock.calls.length;
  expect(firstRun).toBe(2);

  act(() => {
    harness.instance.play();
  });
  advance(6400);

  expect(loopCompleted.mock.calls.length - firstRun).toBe(2);
});

it("gives a numeric loop its stated repeats after reverse playback drifted the count", () => {
  const complete = vi.fn();
  const loopCompleted = vi.fn();
  const harness = setup({
    src: ANIMATION,
    direction: LottieDirection.reverse,
    loop: true,
    subscriptions: { complete, loopCompleted },
  });
  flushLoad();
  act(() => {
    harness.instance.play();
  });
  advance(6400);

  const before = loopCompleted.mock.calls.length;
  act(() => {
    harness.instance.setDirection(LottieDirection.forward);
    harness.instance.setLoop(1);
  });
  advance(6000);

  expect(complete).toHaveBeenCalledOnce();
  expect(loopCompleted.mock.calls.length - before).toBe(1);
});

it("replays the whole budget after stop", () => {
  const loopCompleted = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    loop: 2,
    subscriptions: { loopCompleted },
  });
  flushLoad();
  advance(6400);
  const firstRun = loopCompleted.mock.calls.length;
  expect(firstRun).toBe(2);

  act(() => {
    harness.instance.stop();
    harness.instance.play();
  });
  advance(6400);

  expect(loopCompleted.mock.calls.length - firstRun).toBe(2);
});

it("grants a fresh budget when played with it spent from elsewhere", () => {
  const loopCompleted = vi.fn();
  const harness = setup({
    src: ANIMATION,
    autoplay: true,
    loop: 2,
    subscriptions: { loopCompleted },
  });
  flushLoad();
  advance(6400);
  const firstRun = loopCompleted.mock.calls.length;
  expect(firstRun).toBe(2);

  act(() => {
    harness.instance.seek(10);
    harness.instance.play();
  });
  advance(8000);

  expect(loopCompleted.mock.calls.length - firstRun).toBe(2);
});

it("gives a reverse numeric loop its full budget", () => {
  const complete = vi.fn();
  const harness = setup({
    src: ANIMATION,
    direction: LottieDirection.reverse,
    loop: 2,
  });
  flushLoad();
  act(() => {
    harness.instance.subscribe(LottieSubscription.complete, complete);
    harness.instance.play();
  });

  /* Three passes at two seconds each: not done at five, done by seven. */
  advance(5000);
  expect(complete).not.toHaveBeenCalled();
  advance(2000);
  expect(complete).toHaveBeenCalledOnce();
});

it("replays a completed reverse loop with a full budget again", () => {
  const complete = vi.fn();
  const harness = setup({
    src: ANIMATION,
    direction: LottieDirection.reverse,
    loop: 2,
  });
  flushLoad();
  act(() => {
    harness.instance.subscribe(LottieSubscription.complete, complete);
    harness.instance.play();
  });
  advance(7000);
  expect(complete).toHaveBeenCalledOnce();

  act(() => {
    harness.instance.play();
  });
  advance(5000);
  expect(complete).toHaveBeenCalledOnce();
  advance(2000);
  expect(complete).toHaveBeenCalledTimes(2);
});

it("restarts a finished animation rather than sitting at the end", () => {
  const harness = setup({ src: ANIMATION, autoplay: true });
  flushLoad();
  advance(3000);
  expect(harness.instance.animationItem?.currentFrame).toBe(59);

  act(() => {
    harness.instance.play();
  });
  advance(200);

  expect(harness.instance.animationItem?.currentFrame).toBeLessThan(59);
  expect(harness.instance.animationItem?.isPaused).toBe(false);
});

/*
 * A reactive value that reaches React state but never the engine leaves the
 * animation playing at 1x while the interface says otherwise.
 */
it("applies the speed prop to the engine, not only to the reported value", () => {
  const harness = setup({ src: ANIMATION, speed: 2 });
  flushLoad();

  expect(harness.instance.speed).toBe(2);
  expect(harness.instance.animationItem?.playSpeed).toBe(2);
});

it("applies the direction prop to the engine", () => {
  const harness = setup({ src: ANIMATION, direction: LottieDirection.reverse });
  flushLoad();

  expect(harness.instance.direction).toBe(LottieDirection.reverse);
  expect(harness.instance.animationItem?.playDirection).toBe(-1);
});

it("applies the loop prop to the engine", () => {
  const harness = setup({ src: ANIMATION, loop: 2 });
  flushLoad();

  expect(harness.instance.loop).toBe(2);
  expect(harness.instance.animationItem?.loop).toBe(2);
});

it("applies a reactive prop change without reloading", () => {
  const harness = setup({ src: ANIMATION, speed: 1 });
  flushLoad();

  harness.rerender({ src: ANIMATION, speed: 3 });

  expect(harness.instance.speed).toBe(3);
  expect(harness.instance.animationItem?.playSpeed).toBe(3);
});

it("setSpeed reaches the engine immediately", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.setSpeed(2);
  });

  expect(harness.instance.speed).toBe(2);
  expect(harness.instance.animationItem?.playSpeed).toBe(2);
});

it("setLoop reaches the engine immediately", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.setLoop(3);
  });

  expect(harness.instance.loop).toBe(3);
  expect(harness.instance.animationItem?.loop).toBe(3);
});

it("setDirection reaches the engine immediately, both ways", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.setDirection(LottieDirection.reverse);
  });
  expect(harness.instance.direction).toBe(LottieDirection.reverse);
  expect(harness.instance.animationItem?.playDirection).toBe(-1);

  act(() => {
    harness.instance.setDirection(LottieDirection.forward);
  });
  expect(harness.instance.direction).toBe(LottieDirection.forward);
  expect(harness.instance.animationItem?.playDirection).toBe(1);
});

it("every setter also takes a function of the current value", () => {
  const harness = setup({ src: ANIMATION, speed: 2 });
  flushLoad();

  act(() => {
    harness.instance.setSpeed((previous) => previous * 2);
    harness.instance.setLoop((previous) => (previous === false ? 1 : 0));
    harness.instance.setDirection((previous) =>
      previous === LottieDirection.forward
        ? LottieDirection.reverse
        : LottieDirection.forward,
    );
  });

  expect(harness.instance.speed).toBe(4);
  expect(harness.instance.loop).toBe(1);
  expect(harness.instance.direction).toBe(LottieDirection.reverse);
});

it("warns once per field when a value is driven from a prop and a setter", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION, speed: 2 });
  flushLoad();

  act(() => {
    harness.instance.setSpeed(3);
    harness.instance.setSpeed(4);
  });

  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain('"speed" is driven from both');
});

it("says nothing when a value is only ever driven from one place", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.setSpeed(3);
  });

  expect(warn).not.toHaveBeenCalled();
});

it("calls the latest handler after a re-render, not the one it was given first", () => {
  const first = vi.fn();
  const second = vi.fn();
  const harness = setup({
    src: ANIMATION,
    subscriptions: { play: first },
  });
  flushLoad();
  harness.rerender({ src: ANIMATION, subscriptions: { play: second } });

  act(() => {
    harness.instance.play();
  });

  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledOnce();
});

it("subscribe hands back the function that stops listening", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();
  const onPlay = vi.fn();

  const unsubscribe = harness.instance.subscribe(
    LottieSubscription.play,
    onPlay,
  );
  act(() => {
    harness.instance.play();
  });
  unsubscribe();
  act(() => {
    harness.instance.pause();
    harness.instance.play();
  });

  expect(onPlay).toHaveBeenCalledOnce();
});

it("notifies newState for every transition", () => {
  const newState = vi.fn();
  const harness = setup({ src: ANIMATION, subscriptions: { newState } });
  flushLoad();

  act(() => {
    harness.instance.play();
  });

  expect(newState.mock.calls.map((call) => call[0].state)).toEqual([
    LottieState.stopped,
    LottieState.playing,
  ]);
});

it("destroys the animation when the component goes away", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();
  const item = harness.instance.animationItem;
  if (item === null) {
    throw new Error("expected a loaded animation");
  }
  const destroy = vi.spyOn(item, "destroy");

  harness.unmount();

  expect(destroy).toHaveBeenCalledOnce();
});

it("survives StrictMode, which mounts, tears down and mounts again", () => {
  const harness = setup({ src: ANIMATION }, { strict: true });
  flushLoad();

  expect(harness.instance.state).toBe(LottieState.stopped);
  expect(harness.instance.animationItem).not.toBeNull();
  expect(harness.instance.playableFrames).toBe(60);
});

it("seeks by frame, by percent, by seconds and by marker", () => {
  const harness = setup({ src: WITH_MARKERS });
  flushLoad();

  for (const target of [
    30,
    { frame: 30 },
    { percent: 50 },
    { seconds: 1 },
    { marker: "middle" },
  ]) {
    act(() => {
      harness.instance.seek(0);
    });
    act(() => {
      harness.instance.seek(target);
    });
    expect(harness.instance.animationItem?.currentFrame).toBe(30);
  }
});

/*
 * The engine's own time path is `value * frameModifier`, which folds in the
 * speed and the direction, so the same call lands on frame 30, 60 or -30
 * depending on how the animation happens to be playing. We convert with
 * `frameRate` instead and never hand the engine a value it would scale.
 */
it("converts seconds itself, so speed cannot distort where it lands", () => {
  const harness = setup({ src: ANIMATION, speed: 2 });
  flushLoad();

  act(() => {
    harness.instance.seek({ seconds: 1 });
  });

  expect(harness.instance.animationItem?.currentFrame).toBe(30);
});

it("converts seconds itself, so direction cannot distort it either", () => {
  const harness = setup({ src: ANIMATION, direction: LottieDirection.reverse });
  flushLoad();

  act(() => {
    harness.instance.seek({ seconds: 1 });
  });

  expect(harness.instance.animationItem?.currentFrame).toBe(30);
});

/*
 * `marker.time` is an absolute position in the file, and the engine
 * writes it into a field it later reads as an offset into the playable range,
 * so its own marker seeking is wrong by `firstFrame` for any animation with an
 * in-point or an active segment.
 */
it("seeks to where a marker was placed, not where the engine would land", () => {
  const harness = setup({ src: { ...WITH_MARKERS, ip: 20, op: 80 } });
  flushLoad();

  act(() => {
    harness.instance.seek({ marker: "middle" });
  });

  const item = harness.instance.animationItem;
  expect(item?.firstFrame).toBe(20);
  // The marker is at file frame 30. The engine writes 30 here and renders 50.
  expect(item?.currentFrame).toBe(10);
});

it("treats a marker that labels a span as a position, not a range", () => {
  const harness = setup({ src: WITH_MARKERS });
  flushLoad();

  act(() => {
    harness.instance.seek({ marker: "chapter" });
  });

  expect(harness.instance.animationItem?.currentFrame).toBe(10);
  expect(harness.instance.playableFrames).toBe(60);
});

it("scopes percent and seconds to what a segment left playable", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.playSegments([20, 40]);
  });
  act(() => {
    harness.instance.pause();
  });
  act(() => {
    harness.instance.seek({ percent: 50 });
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(10);

  act(() => {
    harness.instance.seek({ seconds: 0.5 });
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(15);
});

it("keeps playing across a seek, and keeps not playing", () => {
  const harness = setup({ src: ANIMATION, autoplay: true });
  flushLoad();
  advance(100);

  act(() => {
    harness.instance.seek(40);
  });
  expect(harness.instance.state).toBe(LottieState.playing);
  expect(harness.instance.animationItem?.isPaused).toBe(false);
  advance(100);
  expect(harness.instance.animationItem?.currentFrame).toBeGreaterThan(40);

  act(() => {
    harness.instance.pause();
  });
  act(() => {
    harness.instance.seek(10);
  });
  expect(harness.instance.state).toBe(LottieState.paused);
  expect(harness.instance.animationItem?.isPaused).toBe(true);
  expect(harness.instance.animationItem?.currentFrame).toBe(10);
});

it("holds a seek inside the playable range, silently", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.seek(999);
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(59.999);

  act(() => {
    harness.instance.seek(-50);
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(0);

  // A number is never a mistake worth interrupting for, and a drag would
  // otherwise warn on every frame it overshoots by.
  expect(warn).not.toHaveBeenCalled();
});

it("warns and moves nothing when a seek target cannot be resolved", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: WITH_MARKERS });
  flushLoad();

  act(() => {
    harness.instance.seek(20);
  });
  act(() => {
    harness.instance.seek({ marker: "nope" });
  });

  expect(harness.instance.animationItem?.currentFrame).toBe(20);
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("could not be resolved");
});

it("warns when a marker lies outside what a segment left playable", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: WITH_MARKERS });
  flushLoad();

  act(() => {
    harness.instance.playSegments([40, 60]);
  });
  act(() => {
    harness.instance.seek({ marker: "middle" });
  });

  // The marker is at file frame 30, before a range that starts at 40.
  expect(harness.instance.animationItem?.currentFrame).toBe(0);
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("outside the playable range");
});

it("a drag pauses, moves, and resumes what it interrupted", () => {
  const harness = setup({ src: ANIMATION, autoplay: true });
  flushLoad();
  advance(100);
  expect(harness.instance.state).toBe(LottieState.playing);

  act(() => {
    harness.instance.scrubStart();
  });
  expect(harness.instance.state).toBe(LottieState.paused);
  expect(harness.instance.animationItem?.isPaused).toBe(true);

  act(() => {
    harness.instance.scrubTo(20);
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(20);

  act(() => {
    harness.instance.scrubEnd();
  });
  expect(harness.instance.state).toBe(LottieState.playing);
  expect(harness.instance.animationItem?.isPaused).toBe(false);
});

it("a drag that began paused ends paused", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.pause();
  });
  act(() => {
    harness.instance.scrubStart();
    harness.instance.scrubTo(20);
    harness.instance.scrubEnd();
  });

  expect(harness.instance.state).toBe(LottieState.paused);
  expect(harness.instance.animationItem?.isPaused).toBe(true);
  expect(harness.instance.animationItem?.currentFrame).toBe(20);
});

it("holds a drag inside the playable range", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.scrubStart();
  });
  act(() => {
    harness.instance.scrubTo(999);
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(59.999);
  act(() => {
    harness.instance.scrubTo(-10);
  });
  expect(harness.instance.animationItem?.currentFrame).toBe(0);
});

/*
 * Ending a drag is the only thing that reads the remembered playback state, so
 * a drag abandoned off the element leaves a call missing rather than a later
 * seek resuming playback nobody asked for.
 */
it("a drag that ends off the element cannot resume a later seek", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.play();
  });
  expect(harness.instance.state).toBe(LottieState.playing);

  act(() => {
    harness.instance.scrubStart();
    harness.instance.scrubTo(30);
  });
  // The pointer left the element, so no `scrubEnd` ever arrives.
  expect(harness.instance.state).toBe(LottieState.paused);

  act(() => {
    harness.instance.seek(10);
  });

  expect(harness.instance.state).toBe(LottieState.paused);
  expect(harness.instance.animationItem?.isPaused).toBe(true);
  expect(harness.instance.animationItem?.currentFrame).toBe(10);
});

it("reports the range a segment leaves playable", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();
  expect(harness.instance.playableFrames).toBe(60);
  expect(harness.instance.playableDuration).toBe(2);

  act(() => {
    harness.instance.playSegments([0, 30]);
  });

  expect(harness.instance.playableFrames).toBe(30);
  expect(harness.instance.playableDuration).toBe(1);
  expect(harness.instance.state).toBe(LottieState.playing);
});

it("plays several ranges in the order they were given", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.playSegments([
      [0, 10],
      [40, 50],
    ]);
  });
  expect(harness.instance.animationItem?.firstFrame).toBe(0);

  advance(600);

  expect(harness.instance.animationItem?.firstFrame).toBe(40);
});

it("loops the last of several ranges once the earlier ones have played", () => {
  const loopCompleted = vi.fn();
  const harness = setup({
    src: ANIMATION,
    loop: true,
    subscriptions: { loopCompleted },
  });
  flushLoad();

  act(() => {
    harness.instance.playSegments([
      [0, 10],
      [40, 50],
    ]);
  });

  /*
   * Both ranges are a third of a second; three seconds is the first range once
   * and the second several times over, if looping repeats it.
   */
  advance(3000);

  expect(loopCompleted).toHaveBeenCalled();
  expect(harness.instance.animationItem?.firstFrame).toBe(40);
  expect(harness.instance.playableFrames).toBe(10);
  expect(harness.instance.state).toBe(LottieState.playing);

  advance(1000);
  expect(harness.instance.animationItem?.firstFrame).toBe(40);
});

it("plays the span a marker labels, in the animation's own frames", () => {
  const harness = setup({ src: WITH_MARKERS });
  flushLoad();

  act(() => {
    harness.instance.playSegments({ marker: "chapter" });
  });

  expect(harness.instance.animationItem?.firstFrame).toBe(10);
  expect(harness.instance.playableFrames).toBe(20);
});

/*
 * A consumer's natural home for named ranges is an `as const` map, whose
 * tuples are `readonly`. Both entrances take them: the load-time `segment`
 * and the imperative `playSegments`.
 */
it("takes its ranges from an `as const` map", () => {
  const parts = { intro: [0, 30], outro: [40, 50] } as const;
  const harness = setup({ src: ANIMATION, segment: parts.intro });
  flushLoad();

  expect(harness.instance.playableFrames).toBe(30);

  act(() => {
    harness.instance.playSegments(parts.outro);
  });

  expect(harness.instance.animationItem?.firstFrame).toBe(40);
  expect(harness.instance.playableFrames).toBe(10);
});

/*
 * The engine answers a zero-length range by leaving the range alone and playing
 * the whole animation, which is the least useful thing it could do. Everything
 * is checked before it is handed over, so nothing happens at all.
 */
it("warns and changes nothing for a marker that labels no span", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: WITH_MARKERS });
  flushLoad();

  act(() => {
    harness.instance.playSegments({ marker: "middle" });
  });

  expect(harness.instance.playableFrames).toBe(60);
  expect(harness.instance.animationItem?.isPaused).toBe(true);
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("seek to it and play instead");
});

it("warns and changes nothing for a range that describes nothing", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.playSegments([20, 20]);
  });

  expect(harness.instance.playableFrames).toBe(60);
  expect(harness.instance.animationItem?.isPaused).toBe(true);
  expect(warn).toHaveBeenCalledOnce();
});

it("reports the direction the engine settles on for a reversed range", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();
  expect(harness.instance.direction).toBe(LottieDirection.forward);

  act(() => {
    harness.instance.playSegments([40, 10]);
  });

  expect(harness.instance.direction).toBe(LottieDirection.reverse);
  expect(harness.instance.animationItem?.playDirection).toBe(-1);
});

it("reports the turn around when a forward range is played in reverse", () => {
  const harness = setup({ src: ANIMATION, direction: LottieDirection.reverse });
  flushLoad();
  expect(harness.instance.direction).toBe(LottieDirection.reverse);

  act(() => {
    harness.instance.playSegments([10, 40]);
  });

  expect(harness.instance.direction).toBe(LottieDirection.forward);
  expect(harness.instance.animationItem?.playDirection).toBe(1);
});

it("reports the speed the engine settles on", () => {
  const harness = setup({ src: ANIMATION, speed: -2 });
  flushLoad();
  expect(harness.instance.speed).toBe(-2);

  act(() => {
    harness.instance.playSegments([10, 40]);
  });

  expect(harness.instance.speed).toBe(2);
  expect(harness.instance.animationItem?.playSpeed).toBe(2);
});

/*
 * Queueing means waiting for what is playing to finish. With nothing playing
 * there is nothing to wait for, and the engine answers that by playing the
 * whole current range first, which is the behaviour people report as a bug.
 */
it("plays a queued range at once when nothing is playing", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.playSegments([40, 50], { queue: true });
  });

  expect(harness.instance.animationItem?.firstFrame).toBe(40);
  expect(harness.instance.playableFrames).toBe(10);
});

it("lets a queued range wait for the one that is playing", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.playSegments([0, 10]);
  });
  act(() => {
    harness.instance.playSegments([40, 50], { queue: true });
  });

  expect(harness.instance.animationItem?.firstFrame).toBe(0);

  advance(600);

  expect(harness.instance.animationItem?.firstFrame).toBe(40);
});

it("makes the whole animation playable again", () => {
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.playSegments([0, 30]);
  });
  expect(harness.instance.playableFrames).toBe(30);

  act(() => {
    harness.instance.resetSegments();
  });

  expect(harness.instance.playableFrames).toBe(60);
  expect(harness.instance.playableDuration).toBe(2);
});

it("restores the segment the animation was loaded with", () => {
  const harness = setup({ src: ANIMATION, segment: [20, 50] });
  flushLoad();
  expect(harness.instance.playableFrames).toBe(30);

  act(() => {
    harness.instance.playSegments([0, 10]);
  });
  expect(harness.instance.playableFrames).toBe(10);

  act(() => {
    harness.instance.resetSegments();
  });

  expect(harness.instance.playableFrames).toBe(30);
  expect(harness.instance.animationItem?.firstFrame).toBe(20);
});

it("leaves playback as it was when the range is restored", () => {
  const harness = setup({ src: ANIMATION, segment: [20, 50] });
  flushLoad();

  act(() => {
    harness.instance.playSegments([0, 10]);
  });
  act(() => {
    harness.instance.pause();
  });
  act(() => {
    harness.instance.resetSegments();
  });

  expect(harness.instance.animationItem?.isPaused).toBe(true);
  expect(harness.instance.playableFrames).toBe(30);
});

it("warns and moves nothing when a drag is given a number it cannot use", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const harness = setup({ src: ANIMATION });
  flushLoad();

  act(() => {
    harness.instance.scrubStart();
    harness.instance.scrubTo(20);
  });
  act(() => {
    harness.instance.scrubTo(Number.NaN);
  });

  expect(harness.instance.animationItem?.currentFrame).toBe(20);
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("could not be resolved");
});

it("reports the element it is asked to treat as the root", () => {
  let latest: LottieInstance | undefined;

  function Probe({ attached }: { attached: boolean }) {
    const instance = useLottieAnimation(lottie, { src: ANIMATION });
    latest = instance;
    return (
      <section ref={attached ? instance.setRootRef : undefined}>
        <div data-testid="display" ref={instance.setDisplayRef} />
      </section>
    );
  }

  const view = render(<Probe attached={false} />);

  /*
   * A value as well as a callback, because the controls have to read the
   * element back rather than only hand it over: fullscreen is asked of it, and
   * a key press belongs to this animation only if it happened inside it.
   */
  expect(latest?.root).toBeNull();

  view.rerender(<Probe attached />);

  expect(latest?.root?.tagName).toBe("SECTION");
  /* The element around the animation, not the one the animation is drawn in. */
  expect(latest?.root).not.toBe(
    document.querySelector("[data-testid=display]"),
  );

  view.rerender(<Probe attached={false} />);

  expect(latest?.root).toBeNull();
});
