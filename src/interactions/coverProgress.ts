/**
 * Where an element's journey across a viewport stands: 0 as its leading edge
 * reaches the viewport's far end, 1 as its trailing edge leaves the near end.
 *
 * This is the platform's `cover` range written out, which is what makes the
 * fallback and a real `ViewTimeline` agree wherever both can run. It reads
 * a rectangle rather than the live layout, so the caller decides where the
 * rectangle comes from and the arithmetic stays measurable.
 */
export function coverProgress(
  rect: {
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
  },
  viewport: { readonly width: number; readonly height: number },
  axis: "block" | "inline",
): number {
  const size = axis === "inline" ? viewport.width : viewport.height;
  const leading = axis === "inline" ? rect.left : rect.top;
  const length = axis === "inline" ? rect.width : rect.height;
  const span = size + length;
  if (span === 0) {
    return 0;
  }
  return Math.min(Math.max((size - leading) / span, 0), 1);
}

/**
 * The journey progress mapped into a band of it, clamped at the band's ends.
 *
 * Holding still below the band and holding still above it are what replace
 * v2's `stop` bands: they are not features, they are what clamping does.
 */
export function bandProgress(
  progress: number,
  range: readonly [number, number],
): number {
  const [start, end] = range;
  if (end === start) {
    return progress < start ? 0 : 1;
  }
  return Math.min(Math.max((progress - start) / (end - start), 0), 1);
}

/** What one banded sample says happened at the band's edges, if anything. */
export interface BandEdgeEvents {
  enter?: "forward" | "backward";
  leave?: "forward" | "backward";
}

/**
 * Compares two banded samples and names the edges crossed between them.
 *
 * Inside means strictly between the clamps; a sample pinned at 0 or 1 is
 * outside, which is what makes leaving fire exactly when the scrub reaches
 * an end. The first sample of a gesture has no predecessor, and starting
 * already inside counts as entering forward. A single sample that crosses
 * the whole band reports both edges in its direction of travel.
 */
export function bandEdges(
  previous: number | null,
  current: number,
): BandEdgeEvents {
  const isInside = current > 0 && current < 1;
  if (previous === null) {
    return isInside ? { enter: "forward" } : {};
  }

  const wasInside = previous > 0 && previous < 1;
  const direction = current >= previous ? "forward" : "backward";
  const events: BandEdgeEvents = {};
  if (!wasInside && isInside) {
    events.enter = direction;
  }
  if (wasInside && !isInside) {
    events.leave = direction;
  }
  if (
    !wasInside &&
    !isInside &&
    previous !== current &&
    previous <= 0 !== current <= 0
  ) {
    events.enter = direction;
    events.leave = direction;
  }
  return events;
}
