import { act, cleanup, render } from "@testing-library/react";
import lottie from "lottie-web";
import { useCallback } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import type { LottieInstance } from "../animation/types.js";
import { LottieState } from "../animation/types.js";
import { useLottieAnimation } from "../animation/useLottieAnimation.js";
import {
  type IntersectionObserverStub,
  installIntersectionObserverStub,
} from "../test/installIntersectionObserverStub.js";
import { LottieInteractions } from "./LottieInteractions.js";
import { lottieInView } from "./lottieInView.js";

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

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

let stub: IntersectionObserverStub | null = null;

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  stub?.restore();
  stub = null;
  vi.restoreAllMocks();
});

/** A real animation with a root, which is what the trigger watches. */
function AnimProbe({
  instances,
  autoplay = false,
}: {
  instances: Map<string, LottieInstance>;
  autoplay?: boolean;
}) {
  const instance = useLottieAnimation(lottie, { src: ANIMATION, autoplay });
  instances.set("a", instance);
  const setRefs = useCallback(
    (element: HTMLElement | null) => {
      instance.setDisplayRef(element);
      instance.setRootRef(element);
    },
    [instance.setDisplayRef, instance.setRootRef],
  );
  return <div ref={setRefs} />;
}

function mount(options: Parameters<typeof lottieInView>[0] = {}) {
  stub = installIntersectionObserverStub();
  const instances = new Map<string, LottieInstance>();
  const view = render(
    <LottieInteractions interactions={[lottieInView(options)]}>
      <AnimProbe instances={instances} />
    </LottieInteractions>,
  );
  act(() => {
    vi.advanceTimersByTime(0);
  });
  const instance = instances.get("a");
  const observer = stub.last();
  const root = [...observer.observed].at(0);
  if (instance === undefined || root === undefined) {
    throw new Error("the probe never armed");
  }
  return {
    view,
    instances,
    observer,
    root,
    instance: () => instances.get("a"),
  };
}

it("plays on entry and pauses on exit, and only then", () => {
  const { observer, root, instance } = mount();
  expect(instance()?.state).toBe(LottieState.stopped);

  act(() => {
    observer.trigger(root, true);
  });
  expect(instance()?.state).toBe(LottieState.playing);

  act(() => {
    observer.trigger(root, false);
  });
  expect(instance()?.state).toBe(LottieState.paused);

  /* An exit while nothing plays pauses nothing: stopped stays stopped. */
  act(() => {
    instance()?.stop();
  });
  act(() => {
    observer.trigger(root, false);
  });
  expect(instance()?.state).toBe(LottieState.stopped);
});

it("does nothing at all until the observer says something", () => {
  const { instance } = mount();
  act(() => {
    vi.advanceTimersByTime(500);
  });
  expect(instance()?.state).toBe(LottieState.stopped);
});

it("once plays on the first entry and never watches again", () => {
  const { observer, root, instance } = mount({ once: true });

  act(() => {
    observer.trigger(root, true);
  });
  expect(instance()?.state).toBe(LottieState.playing);
  expect(observer.disconnected).toBe(true);

  act(() => {
    instance()?.pause();
    observer.trigger(root, true);
  });
  expect(instance()?.state).toBe(LottieState.paused);
});

it("hands amount and margin to the platform under their real names", () => {
  const { observer } = mount({ amount: 0.5, margin: "10px" });
  expect(observer.options.threshold).toBe(0.5);
  expect(observer.options.rootMargin).toBe("10px");
});

it("watches for any visible pixel unless told otherwise", () => {
  const { observer } = mount();
  expect(observer.options.threshold).toBe(0);
});

it("warns that amount: 1 is a trap", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  lottieInView({ amount: 1 });
  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("never fires");
});

it("warns about a refused margin and watches without it", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const { observer } = mount({ margin: "2em" });

  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0]?.[0]).toContain("px or %");
  expect(observer.options.rootMargin).toBeUndefined();
  expect(observer.observed.size).toBe(1);
});

it("warns once when it arms on something already playing", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  stub = installIntersectionObserverStub();
  const instances = new Map<string, LottieInstance>();
  const view = render(
    <LottieInteractions interactions={[lottieInView()]}>
      <AnimProbe instances={instances} autoplay={true} />
    </LottieInteractions>,
  );
  act(() => {
    vi.advanceTimersByTime(0);
  });

  const redundant = warn.mock.calls.filter(([message]) =>
    String(message).includes("plays by itself"),
  );
  expect(redundant).toHaveLength(1);
  view.unmount();
});

it("shrugs at options it does not recognise and watches with defaults", () => {
  stub = installIntersectionObserverStub();
  const instances = new Map<string, LottieInstance>();
  const broken: unknown[] = [42, { once: "yes" }, { amount: "half" }];

  for (const options of broken) {
    const view = render(
      <LottieInteractions
        interactions={[{ attach: lottieInView().attach, options }]}
      >
        <AnimProbe instances={instances} />
      </LottieInteractions>,
    );
    expect(stub.last().options.threshold).toBe(0);
    view.unmount();
  }
});

it("ignores an empty delivery, and a stale one after the latch", () => {
  const { observer, root, instance } = mount({ once: true });

  act(() => {
    observer.callback([], observer);
  });
  expect(instance()?.state).toBe(LottieState.stopped);

  act(() => {
    observer.trigger(root, true);
  });
  expect(instance()?.state).toBe(LottieState.playing);

  /* A delivery already in flight when the latch closed changes nothing. */
  const rect = root.getBoundingClientRect();
  const stale: IntersectionObserverEntry = {
    target: root,
    isIntersecting: true,
    intersectionRatio: 1,
    boundingClientRect: rect,
    intersectionRect: rect,
    rootBounds: null,
    time: 0,
  };
  act(() => {
    instance()?.pause();
    observer.callback([stale], observer);
  });
  expect(instance()?.state).toBe(LottieState.paused);
});

it("lets go of a root that goes away, and arms nothing new after once", () => {
  stub = installIntersectionObserverStub();
  const instances = new Map<string, LottieInstance>();

  function SwappableProbe({ phase }: { phase: number }) {
    const instance = useLottieAnimation(lottie, { src: ANIMATION });
    instances.set("a", instance);
    const setRefs = useCallback(
      (element: HTMLElement | null) => {
        instance.setDisplayRef(element);
        instance.setRootRef(element);
      },
      [instance.setDisplayRef, instance.setRootRef],
    );
    if (phase === 1) {
      /* The display stays, the root goes. */
      return <div ref={instance.setDisplayRef} />;
    }
    return <div key={phase} ref={setRefs} />;
  }

  function Fixture({ phase }: { phase: number }) {
    return (
      <LottieInteractions interactions={[lottieInView({ once: true })]}>
        <SwappableProbe phase={phase} />
      </LottieInteractions>
    );
  }

  const view = render(<Fixture phase={0} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  const observer = stub.last();
  const root = [...observer.observed].at(0);
  if (root === undefined) {
    throw new Error("never observed");
  }

  view.rerender(<Fixture phase={1} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(observer.disconnected).toBe(true);
  expect(stub.instances).toHaveLength(1);

  /* The root returns as a new element, and the latch has not fired: it arms. */
  view.rerender(<Fixture phase={2} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(stub.instances).toHaveLength(2);

  const second = stub.last();
  const newRoot = [...second.observed].at(0);
  if (newRoot === undefined) {
    throw new Error("never re-observed");
  }
  act(() => {
    second.trigger(newRoot, true);
  });
  expect(instances.get("a")?.state).toBe(LottieState.playing);

  /* After the latch, even a brand-new root earns no observer. */
  view.rerender(<Fixture phase={3} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(stub.instances).toHaveLength(2);
});

it("re-observes nothing while values move, and unobserves on unmount", () => {
  const { view, observer, instance } = mount();

  act(() => {
    instance()?.setSpeed(2);
  });
  act(() => {
    instance()?.setSpeed(3);
  });
  expect(stub?.instances).toHaveLength(1);
  expect(observer.observeCalls).toBe(1);

  view.unmount();
  expect(observer.disconnected).toBe(true);
});

/*
 * The observer arms as soon as the root exists, while the animation is still
 * loading, which is exactly when a real browser delivers its first entry for
 * an animation already on screen.
 */
function mountLoading(options: Parameters<typeof lottieInView>[0] = {}) {
  stub = installIntersectionObserverStub();
  const instances = new Map<string, LottieInstance>();
  const view = render(
    <LottieInteractions interactions={[lottieInView(options)]}>
      <AnimProbe instances={instances} />
    </LottieInteractions>,
  );
  const instance = instances.get("a");
  const observer = stub.last();
  const root = [...observer.observed].at(0);
  if (instance === undefined || root === undefined) {
    throw new Error("the probe never armed");
  }
  expect(instance.state).toBe(LottieState.loading);
  return { view, observer, root, instance: () => instances.get("a") };
}

it("plays after the load when the entry came during it", () => {
  const { observer, root, instance } = mountLoading();

  act(() => {
    observer.trigger(root, true);
  });
  expect(instance()?.state).toBe(LottieState.loading);

  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(instance()?.state).toBe(LottieState.playing);
});

it("once keeps its one chance through a load-time entry", () => {
  const { observer, root, instance } = mountLoading({ once: true });

  act(() => {
    observer.trigger(root, true);
  });
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(instance()?.state).toBe(LottieState.playing);
  expect(observer.disconnected).toBe(true);

  /* The chance was spent by that play: a later delivery replays nothing. */
  act(() => {
    instance()?.pause();
    observer.trigger(root, true);
  });
  expect(instance()?.state).toBe(LottieState.paused);
});

it("starts nothing off-screen when the entry was withdrawn mid-load", () => {
  const { observer, root, instance } = mountLoading();

  act(() => {
    observer.trigger(root, true);
    observer.trigger(root, false);
  });
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(instance()?.state).toBe(LottieState.stopped);
});
