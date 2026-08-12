/**
 * Builds the site's animation from the logo. Run it after changing
 * `public/lottie-logo.svg`:
 *
 *     node scripts/build-anim.mts
 *
 * The logo assembles itself. A dot appears in one corner of each arc, the arc
 * draws away from it to the opposite corner, the whole mark holds still for a
 * beat, then the dot travels the arc's length and takes it away, while the
 * centre turns through two quarters.
 *
 * Three measurements of the logo make that possible, and every constant below
 * rests on them:
 *
 * 1. Each arc is a round-capped circular stroke, fitting its filled outline to
 *    within 0.22px. So an arc is a circle carrying the logo's gradient as a
 *    stroke, trimmed to the 128.6 degrees that is the logo, and the dot is the
 *    stroke's own round cap.
 * 2. The diamond is 4-fold rotationally symmetric: rasterised and turned 90
 *    degrees it differs by 0.040% of pixels, against 2.6% at 45. Every quarter
 *    turn therefore lands back on the mark. Its vertices are spaced unevenly,
 *    so comparing vertex lists will claim otherwise.
 * 3. The gradient is not symmetric, so each rotation is paired with a counter
 *    rotation of the gradient's own endpoints to hold the colour upright.
 *
 * Every embed plays this with a bare `autoplay loop`, which fixes two things.
 * The loop is seamless: the arcs are zero width at both ends and the centre
 * ends a half turn on, which is the same pose. And nothing retraces its path or
 * overshoots its resting length, because either reads as a jump when the
 * direction demos play it backwards.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WEBSITE = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Served as `/anim.json`, and imported from here by the examples that want it
 * as an object. Kept compact because it goes over the wire. */
const TARGET = join(WEBSITE, "public/anim.json");

const TOTAL = 180;
const CENTRE = [80, 80];

/**
 * The beats of the loop as fractions of its length. `middle` is placed on the
 * held beat, so seeking to the marker lands on the finished mark.
 */
const BEAT = {
  wake: 0.06, // the bare centre holds before anything else moves
  grown: 0.13, // the dot has reached the arc's own width
  land: 0.5, // the mark is whole
  hold: 0.68, // the held beat ends
  out: 0.9, // the tail has caught the head at the far corner
  rest: 0.97, // the dot has gone
};

/** Stroke fits for the two arcs, measured from the logo's filled outlines. */
const ARCS = [
  {
    name: "left arc",
    cx: 79.085,
    cy: 79.988,
    r: 61.011,
    w: 18.039,
    a0: 115.7,
    a1: 244.28,
    from: "#21bcb4",
    to: "#6263ef",
    gs: [10.11, 65.72],
    ge: [77.45, 88.33],
  },
  {
    name: "right arc",
    cx: 80.895,
    cy: 79.994,
    r: 61.044,
    w: 18.013,
    a0: -64.27,
    a1: 64.26,
    from: "#1fc3b6",
    to: "#656ceb",
    gs: [82.5, 71.72],
    ge: [149.69, 94.12],
  },
];

const DIAMOND_GRADIENT = {
  from: "#1fc2b4",
  to: "#6363eb",
  gs: [79.89, 47.83],
  ge: [80.11, 112],
};

const svg = readFileSync(join(WEBSITE, "public/lottie-logo.svg"), "utf8");
const diamondMatch = svg.match(/id="Keyframe_diamond"[^>]*d="([^"]+)"/);
if (!diamondMatch) throw new Error("no Keyframe_diamond path in the logo SVG");
const diamondPath = diamondMatch[1];

const round = (n: number) => Math.round(n * 1000) / 1000;

interface Subpath {
  start: number[];
  segments: number[][][];
}

/** An SVG path into subpaths of absolute cubic segments. */
function parsePath(d: string): Subpath[] {
  const tokens = d.match(
    /[MmCcLlSsZz]|[+-]?(?:\d*\.\d+|\d+\.?)(?:e[+-]?\d+)?/g,
  );
  if (!tokens) throw new Error("empty path");
  const subpaths: Subpath[] = [];
  let current: Subpath | null = null;
  let x = 0;
  let y = 0;
  let prevC2: number[] | null = null;
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (!/[MmCcLlSsZz]/.test(cmd)) throw new Error(`unexpected token ${cmd}`);
    i++;
    if (cmd === "M" || cmd === "m") {
      x = cmd === "m" ? x + num() : num();
      y = cmd === "m" ? y + num() : num();
      current = { start: [x, y], segments: [] };
      subpaths.push(current);
      prevC2 = null;
    } else if (cmd === "Z" || cmd === "z") {
      if (current) [x, y] = current.start;
      prevC2 = null;
    } else {
      if (!current) throw new Error(`${cmd} before M`);
      while (i < tokens.length && !/^[MmCcLlSsZz]$/.test(tokens[i])) {
        let c1x: number;
        let c1y: number;
        let c2x: number;
        let c2y: number;
        let ex: number;
        let ey: number;
        if (cmd === "C" || cmd === "c") {
          c1x = num();
          c1y = num();
          c2x = num();
          c2y = num();
          ex = num();
          ey = num();
          if (cmd === "c") {
            c1x += x;
            c1y += y;
            c2x += x;
            c2y += y;
            ex += x;
            ey += y;
          }
        } else if (cmd === "S" || cmd === "s") {
          c2x = num();
          c2y = num();
          ex = num();
          ey = num();
          if (cmd === "s") {
            c2x += x;
            c2y += y;
            ex += x;
            ey += y;
          }
          c1x = prevC2 ? 2 * x - prevC2[0] : x;
          c1y = prevC2 ? 2 * y - prevC2[1] : y;
        } else {
          ex = num();
          ey = num();
          if (cmd === "l") {
            ex += x;
            ey += y;
          }
          c1x = x;
          c1y = y;
          c2x = ex;
          c2y = ey;
        }
        current.segments.push([
          [c1x, c1y],
          [c2x, c2y],
          [ex, ey],
        ]);
        prevC2 = cmd === "L" || cmd === "l" ? null : [c2x, c2y];
        x = ex;
        y = ey;
      }
    }
  }
  return subpaths;
}

/** One subpath of cubics into lottie's vertex, in-tangent, out-tangent form. */
function toLottiePath(subpath: Subpath) {
  const v = [subpath.start.map(round)];
  const o: number[][] = [];
  const i: number[][] = [[0, 0]];
  for (const [c1, c2, end] of subpath.segments) {
    const from = v[v.length - 1];
    o.push([round(c1[0] - from[0]), round(c1[1] - from[1])]);
    i.push([round(c2[0] - end[0]), round(c2[1] - end[1])]);
    v.push(end.map(round));
  }
  // A closed path repeats its first vertex at the end. Merge the two.
  const last = v[v.length - 1];
  if (
    Math.abs(last[0] - v[0][0]) < 0.01 &&
    Math.abs(last[1] - v[0][1]) < 0.01
  ) {
    v.pop();
    i[0] = i[i.length - 1];
    i.pop();
  } else {
    o.push([0, 0]);
  }
  while (o.length < v.length) o.push([0, 0]);
  return { c: true, v, i, o };
}

/**
 * A closed circle whose first vertex sits at `a0`, running in the direction of
 * increasing angle. That alignment is what lets a trim percentage name a pose:
 * the arc is simply the first 128.6 degrees of the circle.
 */
function circlePath(
  { cx, cy, r, a0 }: { cx: number; cy: number; r: number; a0: number },
  segments = 8,
) {
  const step = (2 * Math.PI) / segments;
  const handle = r * (4 / 3) * Math.tan(step / 4);
  const v: number[][] = [];
  const i: number[][] = [];
  const o: number[][] = [];
  for (let n = 0; n < segments; n++) {
    const a = (a0 * Math.PI) / 180 + n * step;
    v.push([round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))]);
    const tx = -Math.sin(a) * handle;
    const ty = Math.cos(a) * handle;
    o.push([round(tx), round(ty)]);
    i.push([round(-tx), round(-ty)]);
  }
  return { c: true, v, i, o };
}

const channels = (hex: string) =>
  [1, 3, 5].map((p) => Number.parseInt(hex.slice(p, p + 2), 16) / 255);
const stops = (from: string, to: string) => [
  0,
  ...channels(from).map(round),
  1,
  ...channels(to).map(round),
];

const EASE = {
  out: { o: { x: [0.33], y: [1] }, i: { x: [0.68], y: [1] } },
  in: { o: { x: [0.32], y: [0] }, i: { x: [0.67], y: [0] } },
  both: { o: { x: [0.65], y: [0] }, i: { x: [0.35], y: [1] } },
  soft: { o: { x: [0.45], y: [0] }, i: { x: [0.25], y: [1] } },
  linear: { o: { x: [0.5], y: [0.5] }, i: { x: [0.5], y: [0.5] } },
};

type EaseName = keyof typeof EASE;
type Ease = (typeof EASE)[EaseName];

type Keyframe = [number, number | number[], EaseName?];
type ScalarKeyframe = [number, number, EaseName?];

function still<T>(k: T) {
  return { a: 0, k };
}

/** Keyframes from `[frame, value, easeOfTheSegmentStartingHere]` triples. */
function anim(frames: Keyframe[]) {
  return {
    a: 1,
    k: frames.map(([t, value, ease = "both"], index) => {
      const s = Array.isArray(value) ? value : [value];
      return index === frames.length - 1
        ? { t: Math.round(t), s }
        : { t: Math.round(t), s, ...EASE[ease] };
    }),
  };
}

const bezier = (p1: number, p2: number, u: number) =>
  3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u ** 2 * p2 + u ** 3;

/** Solves an easing curve for the eased fraction at raw fraction `p`. */
function eased(ease: Ease, p: number) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let u = p;
  for (let k = 0; k < 40; k++) {
    u = (lo + hi) / 2;
    if (bezier(ease.o.x[0], ease.i.x[0], u) < p) lo = u;
    else hi = u;
  }
  return bezier(ease.o.y[0], ease.i.y[0], u);
}

/** Evaluates a scalar keyframe list the way lottie will, for resampling. */
function valueAt(frames: ScalarKeyframe[], t: number): number {
  if (t <= frames[0][0]) return frames[0][1];
  for (let k = 0; k < frames.length - 1; k++) {
    const [t0, v0, ease = "both"] = frames[k];
    const [t1, v1] = frames[k + 1];
    if (t >= t0 && t <= t1) {
      return t1 === t0
        ? v1
        : v0 + (v1 - v0) * eased(EASE[ease], (t - t0) / (t1 - t0));
    }
  }
  return frames[frames.length - 1][1];
}

/**
 * Gradient endpoints that undo a layer rotation, holding the colour upright
 * while the shape turns.
 *
 * Lottie walks a point in a straight line between keyframes, but the true path
 * of a rotating point is an arc, so a keyframe goes in every time the turn has
 * advanced `stepDeg`. That bounds the gap between the two at
 * `radius * (1 - cos(stepDeg / 2))`, which at six degrees is a fiftieth of a
 * pixel here.
 */
function counterRotated(
  rotation: ScalarKeyframe[],
  point: number[],
  stepDeg = 6,
) {
  const times = new Set(rotation.map(([t]) => Math.round(t)));
  times.add(0);
  times.add(TOTAL);
  let last = valueAt(rotation, 0);
  for (let t = 1; t <= TOTAL; t++) {
    const now = valueAt(rotation, t);
    if (Math.abs(now - last) >= stepDeg) {
      times.add(t);
      last = now;
    }
  }
  return anim(
    [...times]
      .sort((a, b) => a - b)
      .map((t): Keyframe => {
        const a = (-valueAt(rotation, t) * Math.PI) / 180;
        const dx = point[0] - CENTRE[0];
        const dy = point[1] - CENTRE[1];
        return [
          t,
          [
            round(CENTRE[0] + dx * Math.cos(a) - dy * Math.sin(a)),
            round(CENTRE[1] + dx * Math.sin(a) + dy * Math.cos(a)),
          ],
          "linear",
        ];
      }),
  );
}

const at = (fraction: number) => fraction * TOTAL;

/**
 * Two quarter turns, one either side of the held beat. The centre is still
 * while the mark is whole, and a half turn on from where it began at the end,
 * which is the same pose.
 */
const ROTATION: ScalarKeyframe[] = [
  [0, 0, "linear"],
  [at(BEAT.wake), 0, "soft"],
  [at(BEAT.land), 90, "linear"],
  [at(BEAT.hold), 90, "soft"],
  [at(BEAT.out), 180, "linear"],
  [TOTAL, 180],
];

/** A sliver short enough to read as a round dot rather than a stub of arc. */
const DOT = 0.35;

/** The share of its circle an arc occupies, as a trim percentage. */
const share = (arc: { a0: number; a1: number }) =>
  round(((arc.a1 - arc.a0) / 360) * 100);

function arcLayer(ind: number, arc: (typeof ARCS)[number]) {
  const length = share(arc);
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: arc.name,
    sr: 1,
    ao: 0,
    ip: 0,
    op: TOTAL,
    st: 0,
    ks: {
      o: still(100),
      r: still(0),
      p: still([80, 80, 0]),
      a: still([80, 80, 0]),
      s: still([100, 100, 100]),
    },
    shapes: [
      {
        ty: "gr",
        nm: arc.name,
        it: [
          { ty: "sh", ks: still(circlePath(arc)), nm: "circle" },
          {
            ty: "tm",
            m: 1,
            nm: "trim",
            // The head runs from the dot to the far corner, then the tail
            // follows it the whole way. Neither ever moves backwards.
            s: anim([
              [0, 0, "linear"],
              [at(BEAT.hold), 0, "both"],
              [at(BEAT.out), length - DOT, "linear"],
              [TOTAL, length - DOT],
            ]),
            e: anim([
              [0, DOT, "linear"],
              [at(BEAT.grown), DOT, "out"],
              [at(BEAT.land), length, "linear"],
              [TOTAL, length],
            ]),
            o: still(0),
          },
          {
            ty: "gs",
            nm: "stroke",
            o: still(100),
            // The dot grows out of nothing on the stroke's width, because a
            // trim of zero length paints nothing at all rather than a cap.
            w: anim([
              [0, 0, "linear"],
              [at(BEAT.wake), 0, "out"],
              [at(BEAT.grown), arc.w, "linear"],
              [at(BEAT.out), arc.w, "in"],
              [at(BEAT.rest), 0, "linear"],
              [TOTAL, 0],
            ]),
            lc: 2,
            lj: 2,
            ml: 4,
            t: 1,
            s: still(arc.gs),
            e: still(arc.ge),
            g: { p: 2, k: still(stops(arc.from, arc.to)) },
          },
          {
            ty: "tr",
            p: still([0, 0]),
            a: still([0, 0]),
            s: still([100, 100]),
            r: still(0),
            o: still(100),
          },
        ],
      },
    ],
  };
}

function diamondLayer(ind: number) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: "diamond",
    sr: 1,
    ao: 0,
    ip: 0,
    op: TOTAL,
    st: 0,
    ks: {
      o: still(100),
      r: anim(ROTATION),
      p: still([80, 80, 0]),
      a: still([80, 80, 0]),
      s: still([100, 100, 100]),
    },
    shapes: [
      {
        ty: "gr",
        nm: "diamond",
        it: [
          // Both subpaths share one fill, so the inner one stays a real hole
          // rather than a shape painted in the background's colour. That is
          // what keeps the mark correct on a dark page.
          ...parsePath(diamondPath).map((subpath) => ({
            ty: "sh",
            ks: still(toLottiePath(subpath)),
            nm: "path",
          })),
          {
            ty: "gf",
            nm: "gradient",
            o: still(100),
            r: 1,
            t: 1,
            s: counterRotated(ROTATION, DIAMOND_GRADIENT.gs),
            e: counterRotated(ROTATION, DIAMOND_GRADIENT.ge),
            g: {
              p: 2,
              k: still(stops(DIAMOND_GRADIENT.from, DIAMOND_GRADIENT.to)),
            },
          },
          {
            ty: "tr",
            p: still([0, 0]),
            a: still([0, 0]),
            s: still([100, 100]),
            r: still(0),
            o: still(100),
          },
        ],
      },
    ],
  };
}

const animation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: TOTAL,
  w: 160,
  h: 160,
  nm: "lottie-react",
  ddd: 0,
  assets: [],
  layers: [
    diamondLayer(1),
    ...ARCS.map((arc, index) => arcLayer(index + 2, arc)),
  ],
  markers: [
    { tm: 0, cm: "start", dr: 0 },
    {
      tm: Math.round(at(BEAT.land)),
      cm: "middle",
      dr: Math.round(at(BEAT.hold) - at(BEAT.land)),
    },
  ],
};

const json = JSON.stringify(animation);
writeFileSync(TARGET, `${json}\n`);
console.log(`wrote ${TARGET}, ${json.length} bytes`);
