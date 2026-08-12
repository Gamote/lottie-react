import type { LottieMarker } from "./resolveSeekTarget.js";

/**
 * The markers a playhead movement passed, in the order it passed them.
 *
 * Positions are compared in the playable range's own coordinates: a marker sits
 * at `time - firstFrame`, which follows a segment the way the playhead does.
 * Moving forward passes a marker when the playhead goes from before it to on or
 * beyond it, so landing exactly on one announces it and the next movement away
 * does not repeat it; moving backward mirrors that. A loop's wrap is not a
 * movement this understands: the caller splits it into the two straight runs it
 * really is and calls twice.
 *
 * The markers must be sorted ascending by `time`, which is what lets a scan
 * stop at the first one past the movement. Returns `null` rather than an empty
 * list when nothing was passed, so the per-frame path allocates nothing.
 */
export function collectMarkerCrossings(
  markers: readonly LottieMarker[],
  firstFrame: number,
  previous: number,
  current: number,
): readonly string[] | null {
  if (markers.length === 0 || previous === current) {
    return null;
  }

  let crossed: string[] | null = null;

  if (current > previous) {
    for (const marker of markers) {
      const frame = marker.time - firstFrame;
      if (frame <= previous) {
        continue;
      }
      if (frame > current) {
        break;
      }
      if (crossed === null) {
        crossed = [];
      }
      crossed.push(marker.payload.name);
    }
  } else {
    for (let index = markers.length - 1; index >= 0; index -= 1) {
      const marker = markers[index];
      const frame = marker.time - firstFrame;
      if (frame >= previous) {
        continue;
      }
      if (frame < current) {
        break;
      }
      if (crossed === null) {
        crossed = [];
      }
      crossed.push(marker.payload.name);
    }
  }

  return crossed;
}
