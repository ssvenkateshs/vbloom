/**
 * Scroll pacing for the experience, shared by the 3D camera and the DOM copy.
 *
 * Follows the lets-scroll model: an interleaved chain of "dive" segments (one per
 * scene, where the camera flies in and settles) and "connector" segments (where it
 * pulls up and hops to the next scene). Distances are in viewport heights.
 *
 * Kept free of three.js so the copy panels and timeline work even without WebGL.
 */

export const SCENE_COUNT = 6;

/** How strongly the camera settles mid-dive while the copy peaks (lets-scroll `linger`). */
export const LINGER = 0.5;

const HERO_HOLD = 0.6;
const RISE = 0.8;
const LAUNCH = 1.5;
const CONNECTOR = 1.05;
const DIVE = [1.6, 1.55, 1.6, 1.55, 1.6, 2.2];

/** Indices of keyframes on the camera path. */
export const POINT = {
  hero: 0,
  rise: 1,
  launch: 2,
  establish: (i: number) => 3 + 4 * i,
  hold: (i: number) => 4 + 4 * i,
  exit: (i: number) => 5 + 4 * i,
  apex: (i: number) => 6 + 4 * i,
};

export const POINT_COUNT = POINT.exit(SCENE_COUNT - 1) + 1;

export type SegmentKind = "hero" | "rise" | "launch" | "dive" | "connector";

export type Segment = {
  kind: SegmentKind;
  scene: number;
  start: number;
  end: number;
  from: number;
  to: number;
};

export type Layout = {
  segments: Segment[];
  total: number;
  /** Scroll position (vh) where each scene's camera is closest to its hold pose. */
  sceneCenter: number[];
  dive: { start: number; end: number }[];
  launchStart: number;
  launchEnd: number;
};

export function buildLayout(): Layout {
  const segments: Segment[] = [];
  let s = 0;
  const push = (kind: SegmentKind, scene: number, length: number, from: number, to: number) => {
    segments.push({ kind, scene, start: s, end: s + length, from, to });
    s += length;
  };

  push("hero", -1, HERO_HOLD, POINT.hero, POINT.hero);
  push("rise", -1, RISE, POINT.hero, POINT.rise);
  const launchStart = s;
  push("launch", -1, LAUNCH, POINT.rise, POINT.establish(0));
  const launchEnd = s;

  const sceneCenter: number[] = [];
  const dive: { start: number; end: number }[] = [];
  for (let i = 0; i < SCENE_COUNT; i++) {
    const start = s;
    push("dive", i, DIVE[i], POINT.establish(i), POINT.exit(i));
    dive.push({ start, end: s });
    sceneCenter.push((start + s) / 2);
    if (i < SCENE_COUNT - 1) push("connector", i, CONNECTOR, POINT.exit(i), POINT.establish(i + 1));
  }

  return { segments, total: s, sceneCenter, dive, launchStart, launchEnd };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The lets-scroll linger remap: f(0) = 0 and f(1) = 1 so seams are untouched, while
 * the slope drops to (1 − L) mid-segment, so the camera dwells where the copy peaks.
 */
export function lingerEase(x: number, L: number) {
  const c = x - 0.5;
  return (1 - L) * x + L * (4 * c * c * c + 0.5);
}

/** Camera path parameter, in keyframe-index units, for a scroll position. */
export function pathAt(layout: Layout, scroll: number) {
  const s = Math.min(Math.max(scroll, 0), layout.total);
  const seg = layout.segments.find((g) => s <= g.end) ?? layout.segments[layout.segments.length - 1];
  const local = seg.end > seg.start ? clamp01((s - seg.start) / (seg.end - seg.start)) : 0;
  let k = local;
  if (seg.kind === "rise" || seg.kind === "launch") k = easeInOutCubic(local);
  else if (seg.kind === "dive") k = lingerEase(local, LINGER);
  return seg.from + (seg.to - seg.from) * k;
}

/** Opacity of a scene's copy panel: it fades in as the camera settles and out before it leaves. */
export function panelOpacity(layout: Layout, index: number, scroll: number) {
  const { start, end } = layout.dive[index];
  const len = end - start;
  const fadeIn = smoothstep(start + 0.14 * len, start + 0.3 * len, scroll);
  if (index === SCENE_COUNT - 1) return fadeIn;
  return fadeIn * (1 - smoothstep(end - 0.3 * len, end - 0.12 * len, scroll));
}

export function heroOpacity(layout: Layout, scroll: number) {
  return 1 - smoothstep(HERO_HOLD * 0.55, layout.launchStart + 0.15, scroll);
}

/** 0 → 1 across the launch away from Earth; drives warp streaks and the timeline reveal. */
export function launchProgress(layout: Layout, scroll: number) {
  return clamp01((scroll - layout.launchStart) / (layout.launchEnd - layout.launchStart));
}

/** The scene the visitor is in (−1 while still at the hero). */
export function activeScene(layout: Layout, scroll: number) {
  if (scroll < layout.launchEnd - 0.35) return -1;
  let best = 0;
  let bestDistance = Infinity;
  layout.sceneCenter.forEach((center, i) => {
    const d = Math.abs(scroll - center);
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  });
  return best;
}
