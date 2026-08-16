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
import {
  installViewTimelineStub,
  type ViewTimelineStub,
} from "../test/installViewTimelineStub.js";
import { LottieInteractions } from "./LottieInteractions.js";
import { lottieScrollScrub } from "./lottieScrollScrub.js";

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

let io: IntersectionObserverStub | null = null;
let timelines: ViewTimelineStub | null = null;

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  io?.restore();
  io = null;
  timelines?.restore();
  timelines = null;
  vi.restoreAllMocks();
});

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

function mountScrub(
  options: Parameters<typeof lottieScrollScrub>[0] = {},
  { withTimeline = true }: { withTimeline?: boolean } = {},
) {
  io = installIntersectionObserverStub();
  if (withTimeline) {
    timelines = installViewTimelineStub();
  }
  const instances = new Map<string, LottieInstance>();
  const view = render(
    <LottieInteractions interactions={[lottieScrollScrub(options)]}>
      <AnimProbe instances={instances} />
    </LottieInteractions>,
  );
  act(() => {
    vi.advanceTimersByTime(0);
  });
  const observer = io.last();
  const root = [...observer.observed].at(0);
  if (root === undefined) {
    throw new Error("the scrub never armed");
  }
  /* A real timeline has a position before anything enters; the stub starts
     inactive, which would otherwise read as a phantom journey's end. */
  timelines?.last().set(0);
  return {
    view,
    observer,
    root,
    instance: () => instances.get("a"),
    enter() {
      act(() => {
        observer.trigger(root, true);
      });
    },
    exit() {
      act(() => {
        observer.trigger(root, false);
      });
    },
    drive(percent: number | null) {
      timelines?.last().set(percent);
      act(() => {
        vi.advanceTimersByTime(32);
      });
    },
    frame() {
      return instances.get("a")?.animationItem?.currentFrame ?? Number.NaN;
    },
  };
}

it("scrubs the playhead to where the scroll timeline stands", () => {
  const scrub = mountScrub();
  scrub.enter();

  scrub.drive(50);
  expect(scrub.frame()).toBeCloseTo(30, 0);

  scrub.drive(80);
  expect(scrub.frame()).toBeCloseTo(48, 0);

  scrub.drive(100);
  expect(scrub.frame()).toBeCloseTo(60, 0);
});

it("holds the playback state across the whole gesture", () => {
  const scrub = mountScrub();
  act(() => {
    scrub.instance()?.play();
  });
  expect(scrub.instance()?.state).toBe(LottieState.playing);

  scrub.enter();
  expect(scrub.instance()?.state).toBe(LottieState.paused);

  scrub.exit();
  expect(scrub.instance()?.state).toBe(LottieState.playing);
});

it("does not sample at all before entering, nor after leaving", () => {
  const scrub = mountScrub();
  scrub.drive(70);
  expect(scrub.frame()).toBe(0);

  scrub.enter();
  scrub.drive(50);
  expect(scrub.frame()).toBeCloseTo(30, 0);

  scrub.exit();
  scrub.drive(90);
  expect(scrub.frame()).toBeCloseTo(30, 0);
});

it("bands the journey and names the edges, reading callbacks live", () => {
  const first: string[] = [];
  const second: string[] = [];

  function Fixture({ log }: { log: string[] }) {
    return (
      <LottieInteractions
        interactions={[
          lottieScrollScrub({
            range: [0.2, 0.45],
            onRangeEnter: (direction) => log.push(`enter ${direction}`),
            onRangeLeave: (direction) => log.push(`leave ${direction}`),
          }),
        ]}
      >
        <AnimProbe instances={instances} />
      </LottieInteractions>
    );
  }

  io = installIntersectionObserverStub();
  timelines = installViewTimelineStub();
  const instances = new Map<string, LottieInstance>();
  const view = render(<Fixture log={first} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  const observer = io.last();
  const root = [...observer.observed].at(0);
  if (root === undefined) {
    throw new Error("never armed");
  }
  const drive = (percent: number) => {
    timelines?.last().set(percent);
    act(() => {
      vi.advanceTimersByTime(32);
    });
  };

  timelines.last().set(0);
  act(() => {
    observer.trigger(root, true);
  });

  drive(10);
  expect(instances.get("a")?.animationItem?.currentFrame).toBe(0);
  expect(first).toEqual([]);

  drive(30);
  expect(instances.get("a")?.animationItem?.currentFrame ?? 0).toBeCloseTo(
    24,
    0,
  );
  expect(first).toEqual(["enter forward"]);

  drive(90);
  expect(first).toEqual(["enter forward", "leave forward"]);

  /* Swapping the handlers re-arms nothing; the next edge lands in the new one. */
  view.rerender(<Fixture log={second} />);
  expect(io.instances).toHaveLength(1);

  drive(30);
  expect(second).toEqual(["enter backward"]);
});

it("asks the platform for the axis it was told", () => {
  mountScrub({ axis: "inline" });
  expect(timelines?.last().axis).toBe("inline");
});

it("falls back to its own geometry where no timeline exists", () => {
  const scrub = mountScrub({}, { withTimeline: false });
  const height = window.innerHeight;
  vi.spyOn(scrub.root, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, (height - 200) / 2, 100, 200),
  );

  scrub.enter();
  act(() => {
    vi.advanceTimersByTime(32);
  });

  expect(scrub.frame()).toBeCloseTo(30, 0);
});

it("warns once and measures by hand when the timeline is inactive", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const scrub = mountScrub();
  const height = window.innerHeight;
  vi.spyOn(scrub.root, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, (height - 200) / 2, 100, 200),
  );

  scrub.enter();
  scrub.drive(null);
  scrub.drive(null);

  expect(scrub.frame()).toBeCloseTo(30, 0);
  const inactive = warn.mock.calls.filter(([message]) =>
    String(message).includes("fell back"),
  );
  expect(inactive).toHaveLength(1);
});

it("measures by hand when the timeline's scroller cannot scroll", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const scrub = mountScrub();
  const height = window.innerHeight;
  /* A quarter of the way through the journey by geometry: the leading edge
     sits a quarter of the span above the viewport's far end. */
  vi.spyOn(scrub.root, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, height - (height + 200) / 4, 100, 200),
  );
  /* `body` with `overflow-x: hidden` is a scroll container that never
     scrolls; happy-dom's zero extents say exactly that. */
  timelines?.last().setSource(document.body);

  scrub.enter();
  scrub.drive(50);

  expect(scrub.frame()).toBeCloseTo(15, 0);
  expect(warn).not.toHaveBeenCalled();
});

it("keeps the timeline when its scroller really scrolls", () => {
  const scrub = mountScrub();
  const scroller = document.createElement("div");
  vi.spyOn(scroller, "scrollHeight", "get").mockReturnValue(1000);
  vi.spyOn(scroller, "clientHeight", "get").mockReturnValue(300);
  timelines?.last().setSource(scroller);

  scrub.enter();
  scrub.drive(50);

  expect(scrub.frame()).toBeCloseTo(30, 0);
});

it("checks the scroller again on each entry", () => {
  const scrub = mountScrub();
  const height = window.innerHeight;
  vi.spyOn(scrub.root, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, height - (height + 200) / 4, 100, 200),
  );
  const scroller = document.createElement("div");
  const extent = vi.spyOn(scroller, "scrollHeight", "get").mockReturnValue(0);
  vi.spyOn(scroller, "clientHeight", "get").mockReturnValue(0);
  timelines?.last().setSource(scroller);

  scrub.enter();
  scrub.drive(50);
  expect(scrub.frame()).toBeCloseTo(15, 0);

  scrub.exit();
  extent.mockReturnValue(1000);
  scrub.enter();
  scrub.drive(50);
  expect(scrub.frame()).toBeCloseTo(30, 0);
});

it("checks the inline extents when the journey runs inline", () => {
  const scrub = mountScrub({ axis: "inline" });
  const scroller = document.createElement("div");
  vi.spyOn(scroller, "scrollWidth", "get").mockReturnValue(1000);
  vi.spyOn(scroller, "clientWidth", "get").mockReturnValue(300);
  timelines?.last().setSource(scroller);

  scrub.enter();
  scrub.drive(50);

  expect(scrub.frame()).toBeCloseTo(30, 0);
});

it("shrugs at options it does not recognise and scrubs the whole journey", () => {
  io = installIntersectionObserverStub();
  timelines = installViewTimelineStub();
  const instances = new Map<string, LottieInstance>();
  const broken: unknown[] = [
    42,
    { range: "wide" },
    { range: [0.2] },
    { axis: "diagonal" },
    { onRangeEnter: 1 },
    { onRangeLeave: 1 },
  ];

  for (const options of broken) {
    const view = render(
      <LottieInteractions
        interactions={[{ attach: lottieScrollScrub().attach, options }]}
      >
        <AnimProbe instances={instances} />
      </LottieInteractions>,
    );
    expect(io.last().observed.size).toBe(1);
    view.unmount();
  }
});

it("reads a timeline that answers bare numbers just the same", () => {
  const scrub = mountScrub();
  scrub.enter();

  timelines?.last().setNumeric(50);
  act(() => {
    vi.advanceTimersByTime(32);
  });

  expect(scrub.frame()).toBeCloseTo(30, 0);
});

it("shrugs off stray deliveries and stray frames", () => {
  const scrub = mountScrub();

  /* An empty delivery says nothing. */
  act(() => {
    scrub.observer.callback([], scrub.observer);
  });
  expect(scrub.instance()?.state).toBe(LottieState.stopped);

  /* A second entry while already scrubbing changes nothing. */
  scrub.enter();
  scrub.enter();
  expect(scrub.instance()?.state).toBe(LottieState.paused);

  /* A frame queued before the exit landed is ignored, not acted on. */
  const raf = vi.spyOn(window, "requestAnimationFrame");
  scrub.drive(40);
  const stray = raf.mock.calls.at(-1)?.[0];
  scrub.exit();
  if (stray !== undefined) {
    act(() => {
      stray(0);
    });
  }
  expect(scrub.frame()).toBeCloseTo(24, 0);
});

it("lets go cleanly when the root goes away mid-life", () => {
  io = installIntersectionObserverStub();
  timelines = installViewTimelineStub();
  const instances = new Map<string, LottieInstance>();

  function SwappableProbe({ rootless }: { rootless: boolean }) {
    const instance = useLottieAnimation(lottie, { src: ANIMATION });
    instances.set("a", instance);
    const setRefs = useCallback(
      (element: HTMLElement | null) => {
        instance.setDisplayRef(element);
        instance.setRootRef(element);
      },
      [instance.setDisplayRef, instance.setRootRef],
    );
    return rootless ? (
      <div ref={instance.setDisplayRef} />
    ) : (
      <div ref={setRefs} />
    );
  }

  function Fixture({ rootless }: { rootless: boolean }) {
    return (
      <LottieInteractions interactions={[lottieScrollScrub()]}>
        <SwappableProbe rootless={rootless} />
      </LottieInteractions>
    );
  }

  const view = render(<Fixture rootless={false} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  const observer = io.last();
  const root = [...observer.observed].at(0);
  if (root === undefined) {
    throw new Error("never armed");
  }

  view.rerender(<Fixture rootless={true} />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  expect(observer.disconnected).toBe(true);
  expect(io.instances).toHaveLength(1);

  /* A delivery from the dead observer scrubs nothing without a root. */
  const rect = root.getBoundingClientRect();
  const staleEntry: IntersectionObserverEntry = {
    target: root,
    isIntersecting: true,
    intersectionRatio: 1,
    boundingClientRect: rect,
    intersectionRect: rect,
    rootBounds: null,
    time: 0,
  };
  act(() => {
    observer.callback([staleEntry], observer);
    vi.advanceTimersByTime(32);
  });
  expect(instances.get("a")?.animationItem?.currentFrame ?? 0).toBe(0);
});

it("survives an unmount mid-scrub with everything let go", () => {
  const scrub = mountScrub();
  act(() => {
    scrub.instance()?.play();
  });
  scrub.enter();
  scrub.drive(40);

  scrub.view.unmount();
  expect(scrub.observer.disconnected).toBe(true);
});

/*
 * The observer arms while the animation still loads, which is when a real
 * browser delivers its first entry for an animation already inside the band.
 * `scrubStart` cannot run during a load, so the load's completion has to
 * start the gesture: without that, nothing snapshots the pre-scrub state,
 * and leaving the band parks an autoplaying animation instead of resuming it.
 */
it("restores autoplay on leave when the entry came during the load", () => {
  io = installIntersectionObserverStub();
  timelines = installViewTimelineStub();
  const instances = new Map<string, LottieInstance>();
  render(
    <LottieInteractions interactions={[lottieScrollScrub()]}>
      <AnimProbe instances={instances} autoplay />
    </LottieInteractions>,
  );
  const observer = io.last();
  const root = [...observer.observed].at(0);
  if (root === undefined) {
    throw new Error("the scrub never armed");
  }
  timelines?.last().set(0);
  expect(instances.get("a")?.state).toBe(LottieState.loading);

  act(() => {
    observer.trigger(root, true);
  });
  act(() => {
    vi.advanceTimersByTime(0);
  });

  /* The gesture holds the playhead: a sample tick leaves it paused. */
  act(() => {
    vi.advanceTimersByTime(32);
  });
  expect(instances.get("a")?.state).toBe(LottieState.paused);

  act(() => {
    observer.trigger(root, false);
  });
  expect(instances.get("a")?.state).toBe(LottieState.playing);
});
