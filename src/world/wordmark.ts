import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Kit, curveThrough } from "./kit";

type Stroke = { points: THREE.Vector2[]; closed?: boolean };

const W = 0.74; // glyph width at cap height 1
const GAP = 0.24;

/** Evenly sample a straight run so the spline hugs it instead of bowing. */
function line(a: [number, number], b: [number, number], step = 0.05): THREE.Vector2[] {
  const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
  return Array.from(
    { length: n + 1 },
    (_, i) => new THREE.Vector2(a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n),
  );
}

function arc(cx: number, cy: number, r: number, from: number, to: number, step = 0.05): THREE.Vector2[] {
  const n = Math.max(4, Math.ceil((Math.abs(to - from) * r) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  });
}

const join = (...runs: THREE.Vector2[][]) => runs.flatMap((run, i) => (i === 0 ? run : run.slice(1)));

/** Thin geometric glyphs, in the spirit of the NEOBOT wordmark. */
const GLYPHS: Record<string, Stroke[]> = {
  V: [{ points: join(line([0, 1], [W / 2, 0]), line([W / 2, 0], [W, 1])) }],
  B: [
    {
      points: join(
        line([0, 0], [0, 1]),
        line([0, 1], [W - 0.24, 1]),
        arc(W - 0.24, 0.76, 0.24, Math.PI / 2, -Math.PI / 2),
        line([W - 0.24, 0.52], [0, 0.52]),
      ),
    },
    {
      points: join(
        line([0, 0.52], [W - 0.26, 0.52]),
        arc(W - 0.26, 0.26, 0.26, Math.PI / 2, -Math.PI / 2),
        line([W - 0.26, 0], [0, 0]),
      ),
    },
  ],
  L: [{ points: join(line([0, 1], [0, 0]), line([0, 0], [W * 0.86, 0])) }],
  O: [
    {
      // Rounded rectangle, like the squarish O in the reference.
      points: join(
        line([0.3, 1], [W - 0.3, 1]),
        arc(W - 0.3, 0.7, 0.3, Math.PI / 2, 0),
        line([W, 0.7], [W, 0.3]),
        arc(W - 0.3, 0.3, 0.3, 0, -Math.PI / 2),
        line([W - 0.3, 0], [0.3, 0]),
        arc(0.3, 0.3, 0.3, -Math.PI / 2, -Math.PI),
        line([0, 0.3], [0, 0.7]),
        arc(0.3, 0.7, 0.3, Math.PI, Math.PI / 2),
      ),
      closed: true,
    },
  ],
  M: [
    {
      points: join(
        line([0, 0], [0, 1]),
        line([0, 1], [W / 2, 0.36]),
        line([W / 2, 0.36], [W, 1]),
        line([W, 1], [W, 0]),
      ),
    },
  ],
};

/**
 * Neon-tube wordmark as one merged mesh. Returns a group whose width is `width`
 * world units, centred on the origin.
 */
export function buildWordmark(kit: Kit, text: string, width: number, color: number, intensity = 1.45) {
  const glyphs = text.toUpperCase().split("");
  const total = glyphs.length * W + (glyphs.length - 1) * GAP;
  const scale = width / total;
  const radius = 0.0105 / scale; // keep the tube visually thin regardless of size
  const geometries: THREE.BufferGeometry[] = [];

  glyphs.forEach((ch, i) => {
    const x0 = i * (W + GAP) - total / 2;
    for (const stroke of GLYPHS[ch] ?? []) {
      const pts = stroke.points.map((p) => new THREE.Vector3(x0 + p.x, p.y - 0.5, 0));
      if (stroke.closed) pts.pop();
      const curve = curveThrough(pts, stroke.closed);
      geometries.push(new THREE.TubeGeometry(curve, pts.length * 3, radius, 6, stroke.closed ?? false));
    }
  });

  const merged = mergeGeometries(geometries, false);
  geometries.forEach((g) => g.dispose());
  const mesh = new THREE.Mesh(merged, kit.glow(color, intensity));
  mesh.scale.setScalar(scale);
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}
