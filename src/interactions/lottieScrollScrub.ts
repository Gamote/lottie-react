"use client";

import type { LottieInstance } from "../animation/types.js";
import { LottieState } from "../animation/types.js";
import { bandEdges, bandProgress, coverProgress } from "./coverProgress.js";
import type { LottieInteraction, LottieInteractionContext } from "./types.js";

/** What {@link lottieScrollScrub} can be told. */
export interface LottieScrollScrubOptions {
  /**
   * The stretch of the element's journey the animation maps onto, as
   * fractions 0 to 1 of it. Below the range the animation holds its first
   * frame and above it its last, which is what clamping does. The whole
   * journey unless narrowed.
   */
  range?: readonly [number, number];
  /** Which axis the journey runs along. The block axis unless said otherwise. */
  axis?: "block" | "inline";
  /** Called as the playhead's band is entered, with the travel direction. */
  onRangeEnter?: (
    direction: "forward" | "backward",
    lottie: LottieInstance,
  ) => void;
  /** Called as the band is left: at its far edge forward, its near edge back. */
  onRangeLeave?: (
    direction: "forward" | "backward",
    lottie: LottieInstance,
  ) => void;
}

function isRange(value: unknown): value is readonly [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function isScrubOptions(value: unknown): value is LottieScrollScrubOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if ("range" in value && !isRange(value.range)) {
    return false;
  }
  if ("axis" in value && value.axis !== "block" && value.axis !== "inline") {
    return false;
  }
  if ("onRangeEnter" in value && typeof value.onRangeEnter !== "function") {
    return false;
  }
  return !("onRangeLeave" in value && typeof value.onRangeLeave !== "function");
}

/** Whether an element has anything to scroll along the axis right now. */
function canScrollAlong(element: Element, axis: "block" | "inline"): boolean {
  return axis === "inline"
    ? element.scrollWidth > element.clientWidth
    : element.scrollHeight > element.clientHeight;
}

/*
 * A view timeline binds to the nearest ancestor that is a scroll container,
 * and any non-visible overflow makes an element one whether or not it ever
 * scrolls: `overflow-x: hidden` on `body` makes `body` the scroller while the
 * viewport is what moves, and the timeline then holds one position. So the
 * timeline is trusted only when its scroller is the document's own, whose
 * extents are the viewport's and not to be second-guessed, or when it can
 * scroll along the axis. A `null` scroller is left to the inactive path,
 * which reads `currentTime`.
 */
function timelineIsUsable(
  timeline: ViewTimeline,
  axis: "block" | "inline",
): boolean {
  const source = timeline.source;
  if (source === null || source === document.scrollingElement) {
    return true;
  }
  return canScrollAlong(source, axis);
}

function attachScrollScrub(
  context: LottieInteractionContext,
  raw: unknown,
): (() => void) | undefined {
  const options = isScrubOptions(raw) ? raw : {};
  const range = options.range ?? ([0, 1] as const);
  const axis = options.axis ?? "block";

  let observer: IntersectionObserver | null = null;
  let observedRoot: HTMLElement | null = null;
  let timeline: ViewTimeline | null = null;
  let useTimeline = false;
  let frameHandle: number | null = null;
  let scrubbing = false;
  let gestureStarted = false;
  let previousBand: number | null = null;
  let warnedInactive = false;

  const readProgress = (root: HTMLElement): number => {
    if (useTimeline && timeline !== null) {
      const time = timeline.currentTime;
      if (typeof time === "number") {
        return Math.min(Math.max(time / 100, 0), 1);
      }
      if (
        time !== null &&
        typeof time === "object" &&
        "value" in time &&
        typeof time.value === "number"
      ) {
        return Math.min(Math.max(time.value / 100, 0), 1);
      }
      /*
       * An inactive timeline answers null, which is what a source that does
       * not scroll produces. The geometry fallback carries that sample.
       */
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        if (!warnedInactive) {
          warnedInactive = true;
          console.warn(
            "[lottie-react] the scroll timeline reported no position, so the scrub fell back to " +
              "measuring the element itself. This happens when nothing around the animation scrolls.",
          );
        }
      }
    }
    return coverProgress(
      root.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight },
      axis,
    );
  };

  const sample = () => {
    frameHandle = null;
    const root = context.lottie.root;
    if (!scrubbing || root === null) {
      return;
    }
    /*
     * An engine mid-load is not driven, and not only because it is early: a
     * scrub write would move the state off `loading` itself, and the gesture's
     * start below tells the load's completion apart by exactly that state.
     */
    if (context.lottie.state === LottieState.loading) {
      frameHandle = requestAnimationFrame(sample);
      return;
    }
    const band = bandProgress(readProgress(root), range);
    const events = bandEdges(previousBand, band);
    previousBand = band;

    context.lottie.scrubTo(band * context.lottie.playableFrames);
    if (events.enter !== undefined || events.leave !== undefined) {
      /* Re-read and re-narrow, so an inline handler swapped since the arm is
         the one that fires, without the swap ever forcing a re-arm. */
      const liveRaw = context.options();
      const live = isScrubOptions(liveRaw) ? liveRaw : {};
      if (events.enter !== undefined) {
        live.onRangeEnter?.(events.enter, context.lottie);
      }
      if (events.leave !== undefined) {
        live.onRangeLeave?.(events.leave, context.lottie);
      }
    }
    frameHandle = requestAnimationFrame(sample);
  };

  const startScrubbing = () => {
    if (scrubbing) {
      return;
    }
    scrubbing = true;
    previousBand = null;
    /*
     * Decided once per entry rather than per frame: an entry is when layout
     * exists to be read, and reading extents every frame would put the layout
     * cost back on the platform path that exists to avoid it. A scroller that
     * only later grows something to scroll is picked up on the next entry.
     */
    useTimeline = timeline !== null && timelineIsUsable(timeline, axis);
    if (context.lottie.state !== LottieState.loading) {
      gestureStarted = true;
      context.lottie.scrubStart();
    }
    sample();
  };

  const stopScrubbing = () => {
    if (!scrubbing) {
      return;
    }
    scrubbing = false;
    gestureStarted = false;
    if (frameHandle !== null) {
      cancelAnimationFrame(frameHandle);
      frameHandle = null;
    }
    context.lottie.scrubEnd();
  };

  const handleEntries: IntersectionObserverCallback = (entries) => {
    const entry = entries.at(-1);
    if (entry === undefined) {
      return;
    }
    if (entry.isIntersecting) {
      startScrubbing();
    } else {
      stopScrubbing();
    }
  };

  const arm = () => {
    const root = context.lottie.root;
    if (root === observedRoot) {
      return;
    }
    stopScrubbing();
    observer?.disconnect();
    observer = null;
    timeline = null;
    useTimeline = false;
    observedRoot = root;
    if (root === null) {
      return;
    }
    const ViewTimelineCtor = globalThis.ViewTimeline;
    if (ViewTimelineCtor !== undefined) {
      timeline = new ViewTimelineCtor({ subject: root, axis });
    }
    observer = new IntersectionObserver(handleEntries);
    observer.observe(root);
  };

  const stopListening = context.onChange(() => {
    /*
     * An entry that arrived during the load could not start the gesture, and
     * the observer will not repeat it, so the load's completion starts it.
     * Without this, nothing snapshots the pre-scrub playback state, and
     * ending the scrub parks an autoplaying animation instead of resuming it.
     */
    if (
      scrubbing &&
      !gestureStarted &&
      context.lottie.state !== LottieState.loading &&
      context.lottie.state !== LottieState.error
    ) {
      gestureStarted = true;
      context.lottie.scrubStart();
    }
    arm();
  });
  arm();

  return () => {
    stopListening();
    stopScrubbing();
    observer?.disconnect();
  };
}

/**
 * Ties the playhead to how far the animation has travelled through the
 * viewport, so scrolling scrubs it instead of time playing it.
 *
 * ```jsx
 * <LottieInteractions
 *   interactions={[
 *     lottieScrollScrub({
 *       range: [0.2, 0.45],
 *       onRangeLeave: (direction, lottie) => {
 *         if (direction === "forward") lottie.playSegments([[45, 60]]);
 *       },
 *     }),
 *   ]}
 * >
 *   <Lottie src={story} autoplay={false} />
 * </LottieInteractions>
 * ```
 *
 * Progress is the platform's own scroll timeline where the browser has one
 * and its scroller is one that scrolls, and the same arithmetic measured by
 * hand against the viewport where it does not; the numbers agree by
 * construction. While the animation is out of view nothing samples
 * at all, and playback state is held by the scrub gesture, so whatever was
 * true before the scrub is restored when it leaves.
 */
export function lottieScrollScrub(
  options: LottieScrollScrubOptions = {},
): LottieInteraction {
  return { attach: attachScrollScrub, options };
}
