import type { AnimationItem, AnimationSegment } from "lottie-web";
import type { LottieSeekTarget, LottieSegments } from "./types.js";

/**
 * A marker as the engine parses it, which is not how the engine declares it.
 *
 * `markers` and `getMarkerData` exist at runtime and appear nowhere in
 * lottie-web's types, and the obvious repair is unavailable: `AnimationItem` is
 * a type alias rather than an interface, so a module augmentation collides with
 * `TS2300` instead of merging. Hence a shape of our own and the guard below.
 *
 * `duration` is optional because the parser copies it straight from the file,
 * where a marker placed as a point carries no duration at all.
 */
export interface LottieMarker {
  time: number;
  duration?: number;
  payload: { name: string };
}

/**
 * Narrows an unknown value to a marker we can use.
 *
 * A marker whose After Effects comment parsed as JSON without a `name` fails
 * here, which matches the engine: such a marker cannot be addressed by name at
 * all, so a designer can label something the code has no way to reach.
 */
function isMarker(value: unknown): value is LottieMarker {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("time" in value) || typeof value.time !== "number") {
    return false;
  }
  if ("duration" in value) {
    const { duration } = value;
    if (duration !== undefined && typeof duration !== "number") {
      return false;
    }
  }
  if (!("payload" in value)) {
    return false;
  }
  const { payload } = value;
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  return "name" in payload && typeof payload.name === "string";
}

/**
 * The animation's markers, or an empty list when it has none we can read.
 *
 * The `in` check is what makes the undeclared property readable without a cast:
 * it narrows to a record whose value is `unknown`, which the guard above then
 * takes the rest of the way.
 */
export function readMarkers(item: AnimationItem): LottieMarker[] {
  if (!("markers" in item)) {
    return [];
  }
  const { markers } = item;
  if (!Array.isArray(markers)) {
    return [];
  }
  const values: readonly unknown[] = markers;
  return values.filter(isMarker);
}

function findMarker(item: AnimationItem, name: string): LottieMarker | null {
  for (const marker of readMarkers(item)) {
    if (marker.payload.name === name) {
      return marker;
    }
  }
  return null;
}

/** The frame a target asks for, before it is held inside the playable range. */
function requestedFrame(
  item: AnimationItem,
  target: LottieSeekTarget,
): number | null {
  if (typeof target === "number") {
    return target;
  }
  const { frame, percent, seconds, marker } = target;
  if (frame !== undefined) {
    return frame;
  }
  if (percent !== undefined) {
    return (item.totalFrames * percent) / 100;
  }
  if (seconds !== undefined) {
    /*
     * Converted here rather than by the engine, whose own time path multiplies
     * by `playSpeed` and `playDirection`, so the same call lands on three
     * different frames depending on how the animation happens to be playing.
     */
    return seconds * item.frameRate;
  }
  /*
   * The marker is last and needs no test of its own, because the type admits
   * exactly one unit, so nothing else can be left. A name that resolves to
   * nothing and a descriptor naming no unit at all are the same answer anyway.
   *
   * `marker.time` is an absolute position in the file, while the engine reads
   * the value written here as an offset into the playable range. Subtracting
   * `firstFrame` is what puts the playhead where the designer placed it, and it
   * is deliberately not what `goToAndStop(markerName)` does.
   */
  const found = marker === undefined ? null : findMarker(item, marker);
  return found === null ? null : found.time - item.firstFrame;
}

/**
 * Turns a seek target into a frame inside the playable range.
 *
 * Returns `null` when the target names nothing the animation has, which is an
 * unknown marker or a number that is not finite. `requested` is what was asked
 * for and `frame` is what is reachable, so a caller can tell that a position
 * was pulled back to the range without this having to say anything about it.
 */
export function resolveSeekTarget(
  item: AnimationItem,
  target: LottieSeekTarget,
): { frame: number; requested: number } | null {
  const requested = requestedFrame(item, target);
  if (requested === null || !Number.isFinite(requested)) {
    return null;
  }
  /*
   * The last position that can be drawn, which is not the last frame number.
   * The engine renders between frames, so the final frame's own span is real
   * motion and stopping a whole frame short of it throws the end of the
   * movement away: on a 32 frame animation that is the last 3% of it, so
   * seeking to 100% never showed whatever the animation settles into.
   *
   * The frame at `totalFrames` is never drawn, which the Lottie specification
   * states directly, so the bound has to sit just below it rather than on it.
   * The margin is the engine's own: lottie-web uses `totalFrames - 0.001` for
   * exactly this when it starts a segment from the end.
   */
  const last = Math.max(item.totalFrames - 0.001, 0);
  return { frame: Math.min(Math.max(requested, 0), last), requested };
}

/** Distinguishes one range from a list of them, which share an array type. */
function isSingleRange(
  segments: readonly [number, number] | readonly (readonly [number, number])[],
): segments is readonly [number, number] {
  return typeof segments[0] === "number";
}

/**
 * Turns what a caller passed into the list of ranges the engine takes.
 *
 * Returns `null` when nothing playable was described: a range whose ends are
 * equal or not finite, an empty list, an unknown marker, or a marker carrying
 * no duration. That last one is a labelled position rather than a labelled
 * span, and the engine would respond to it by playing the entire animation.
 *
 * A marker's frames are used as they are. Unlike a seek, a range endpoint is
 * absolute, so the correction that seeking needs would be wrong here.
 *
 * The result is always freshly built, never the caller's own arrays, because
 * the engine queues whatever it is handed and the input is typed `readonly`.
 */
export function resolveSegments(
  item: AnimationItem,
  segments: LottieSegments,
): AnimationSegment[] | null {
  /* `in` rather than `Array.isArray`, which does not narrow readonly arrays. */
  if ("marker" in segments) {
    const marker = findMarker(item, segments.marker);
    if (marker === null || !marker.duration) {
      return null;
    }
    return [[marker.time, marker.time + marker.duration]];
  }

  const ranges = isSingleRange(segments) ? [segments] : segments;
  if (ranges.length === 0) {
    return null;
  }
  for (const [start, end] of ranges) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) {
      return null;
    }
  }
  return ranges.map(([start, end]): AnimationSegment => [start, end]);
}
