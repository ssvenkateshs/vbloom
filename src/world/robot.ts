import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Kit, PALETTE, clamp, damp, hdr, lerp } from "./kit";

export type Expression = "neutral" | "blink" | "happy" | "alert" | "tired" | "focus";

/** 5×4 LED masks, top row first. */
const EYE_MASKS: Record<Expression, string[]> = {
  neutral: [".###.", "#####", "#####", ".###."],
  blink: [".....", ".....", "#####", "....."],
  happy: [".....", ".###.", "#...#", "....."],
  alert: ["#...#", ".#.#.", ".#.#.", "#...#"],
  tired: [".....", ".....", "#####", ".###."],
  focus: [".....", "#####", "#####", "....."],
};

const EYE_COLS = 5;
const EYE_ROWS = 4;
const DOT_STEP = 0.0142;

export type RobotOptions = {
  detail?: "high" | "low";
  eye?: number;
  accent?: number;
  emblem?: boolean;
  antenna?: boolean;
  seed?: number;
};

const _v = new THREE.Vector3();
const _t = new THREE.Vector3();
const _d = new THREE.Vector3();
const _u = new THREE.Vector3();
const _n = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _normal = new THREE.Vector3();
const FORWARD = new THREE.Vector3(0, 0, 1);

class Arm {
  readonly shoulder = new THREE.Group();
  readonly upper = new THREE.Group();
  readonly elbow = new THREE.Group();
  readonly wrist = new THREE.Group();
  readonly hand = new THREE.Group();
  readonly fingers: { base: THREE.Group; mid: THREE.Group }[] = [];
  thumb?: THREE.Group;
  readonly restQ = new THREE.Quaternion();
  restElbow = -0.32;
  weight = 0;
  targetWeight = 0;
  readonly target = new THREE.Vector3();
  hasTarget = false;
  open = 0.3;

  constructor(
    readonly side: 1 | -1,
    readonly L1: number,
    readonly L2: number,
  ) {
    this.restQ.setFromEuler(new THREE.Euler(0.08, 0, side * 0.13));
    this.upper.quaternion.copy(this.restQ);
    this.elbow.position.y = -L1;
    this.wrist.position.y = -L2;
    this.shoulder.add(this.upper);
    this.upper.add(this.elbow);
    this.elbow.add(this.wrist);
    this.wrist.add(this.hand);
    // Palm faces the body at rest.
    this.hand.rotation.y = -side * Math.PI * 0.5;
  }

  /** Analytic two-bone IK in shoulder space, blended with the rest pose by `weight`. */
  solve(weight: number) {
    if (weight <= 0.001 || !this.hasTarget) {
      this.upper.quaternion.copy(this.restQ);
      this.elbow.rotation.set(this.restElbow, 0, 0);
      return;
    }
    const { L1, L2 } = this;
    _t.copy(this.target);
    this.shoulder.worldToLocal(_t);
    const dist = clamp(_t.length(), 0.14, (L1 + L2) * 0.995);
    _d.copy(_t).normalize();
    // The elbow should drift outward, down and slightly back, like a relaxed reach.
    _pole.set(this.side * 0.85, -0.55, -0.45);
    _n.crossVectors(_d, _pole);
    if (_n.lengthSq() < 1e-6) _n.set(1, 0, 0);
    _n.normalize();
    const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
    _u.copy(_d).applyAxisAngle(_n, Math.acos(cosA));
    _x.copy(_n);
    _y.copy(_u).negate();
    _z.crossVectors(_x, _y);
    _m.makeBasis(_x, _y, _z);
    _q.setFromRotationMatrix(_m);
    const cosB = clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1);
    const bend = Math.PI - Math.acos(cosB);
    this.upper.quaternion.copy(this.restQ).slerp(_q, weight);
    this.elbow.rotation.set(lerp(this.restElbow, -bend, weight), 0, 0);
  }

  setFingers(open: number) {
    const curl = 1 - open;
    for (const f of this.fingers) {
      f.base.rotation.x = -curl * 1.05;
      f.mid.rotation.x = -curl * 1.25;
    }
    if (this.thumb) this.thumb.rotation.x = -curl * 0.6;
  }
}

/**
 * A procedural glossy-black humanoid. Built from primitives so it needs no model
 * files, rigged so the head can track a point and either hand can reach for one.
 */
export class Robot {
  readonly root = new THREE.Group();
  readonly pelvis = new THREE.Group();
  readonly spine = new THREE.Group();
  readonly neck = new THREE.Group();
  readonly head = new THREE.Group();
  readonly arms: [Arm, Arm];
  /** Index of the arm on the robot's left (+X), which appears on screen right. */
  static readonly LEFT = 1;
  static readonly RIGHT = 0;

  private readonly detail: "high" | "low";
  private readonly eyeMesh: THREE.InstancedMesh;
  private readonly eyeColor: THREE.Color;
  private readonly emblemMat?: THREE.MeshBasicMaterial;
  private readonly torso: THREE.Mesh;
  private expression: Expression = "neutral";
  private shown: Expression | null = null;
  private moodExpression: Expression = "neutral";
  private blinkIn = 2 + Math.random() * 3;
  private blinkLeft = 0;
  private waveLeft = 0;
  private yaw = 0;
  private pitch = 0;
  private gazeX = 0;
  private gazeY = 0;
  private readonly phase: number;
  private readonly lookPoint = new THREE.Vector3();
  private looking = false;
  /** 0 = upright, 1 = slumped (used by the overwhelmed robot in the chaos scene). */
  slump = 0;
  /** Typing motion for robots working at consoles. */
  working = false;
  private readonly workAnchors: [THREE.Vector3, THREE.Vector3] = [new THREE.Vector3(), new THREE.Vector3()];

  constructor(
    private readonly kit: Kit,
    opts: RobotOptions = {},
  ) {
    this.detail = opts.detail ?? "high";
    this.phase = (opts.seed ?? 1) * 1.7;
    const accent = opts.accent ?? PALETTE.violet;
    this.eyeColor = hdr(opts.eye ?? PALETTE.violet, 4.2);
    const hi = this.detail === "high";
    const seg = hi ? 40 : 18;
    const shell = kit.shell(this.detail);
    const joint = kit.joint();
    const ring = kit.glow(accent, 3.2);
    const strip = kit.glow(accent, 2.2);

    const mesh = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      parent: THREE.Object3D,
      x = 0,
      y = 0,
      z = 0,
    ) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    };
    const capsule = (r: number, h: number) => new THREE.CapsuleGeometry(r, h, hi ? 8 : 4, hi ? 24 : 12);
    const ball = (r: number) => new THREE.SphereGeometry(r, seg, Math.round(seg * 0.6));
    const torus = (r: number, tube: number) => new THREE.TorusGeometry(r, tube, 8, hi ? 48 : 24);

    this.root.name = "robot";
    this.pelvis.name = "robot-pelvis";
    this.spine.name = "robot-spine";
    this.neck.name = "robot-neck";
    this.head.name = "robot-head";
    this.root.add(this.pelvis);
    this.pelvis.position.y = 0.98;

    // --- hips + legs ---------------------------------------------------------
    mesh(new RoundedBoxGeometry(0.34, 0.15, 0.22, hi ? 4 : 2, 0.06), shell, this.pelvis);
    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.1, -0.07, 0);
      this.pelvis.add(hip);
      mesh(ball(0.068), joint, hip);
      mesh(capsule(0.092, 0.26), shell, hip, 0, -0.21, 0);
      const knee = new THREE.Group();
      knee.position.y = -0.42;
      hip.add(knee);
      mesh(ball(0.062), joint, knee);
      const kr = mesh(torus(0.066, 0.006), ring, knee);
      kr.rotation.y = Math.PI / 2;
      mesh(capsule(0.076, 0.26), shell, knee, 0, -0.2, 0);
      mesh(capsule(0.006, 0.14), strip, knee, 0, -0.2, 0.077);
      mesh(new RoundedBoxGeometry(0.12, 0.07, 0.24, 2, 0.03), shell, knee, 0, -0.43, 0.04);
    }

    // --- spine + torso -------------------------------------------------------
    this.spine.position.y = 0.08;
    this.pelvis.add(this.spine);
    mesh(capsule(0.12, 0.05), joint, this.spine, 0, 0.0, 0);
    for (const y of [-0.015, 0.035]) {
      const r = mesh(torus(0.123, 0.008), joint, this.spine, 0, y, 0);
      r.rotation.x = Math.PI / 2;
    }
    const profile = [
      [0.001, 0.02],
      [0.14, 0.03],
      [0.16, 0.1],
      [0.19, 0.2],
      [0.235, 0.31],
      [0.268, 0.43],
      [0.275, 0.51],
      [0.258, 0.58],
      [0.2, 0.628],
      [0.1, 0.652],
      [0.001, 0.658],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    this.torso = mesh(new THREE.LatheGeometry(profile, hi ? 72 : 32), shell, this.spine);
    this.torso.scale.set(1.25, 1, 0.74);
    // Side light strips, like the glowing seams on the reference robots.
    for (const side of [-1, 1]) {
      const s = mesh(capsule(0.006, 0.17), strip, this.spine, side * 0.295, 0.37, 0.05);
      s.rotation.z = side * 0.22;
    }
    const collar = mesh(torus(0.085, 0.012), joint, this.spine, 0, 0.655, 0);
    collar.rotation.x = Math.PI / 2;

    if (opts.emblem !== false) {
      // Dotted "V" with a leaf dot: the VBloom mark, in the spirit of NEOBOT's chest logo.
      const dots: [number, number][] = [];
      for (let i = 0; i <= 5; i++) {
        const k = i / 5;
        dots.push([-0.062 + 0.062 * k, 0.05 - 0.1 * k]);
        if (i < 5) dots.push([0.062 - 0.062 * k, 0.05 - 0.1 * k]);
      }
      dots.push([0.08, 0.072], [0.093, 0.087], [0.07, 0.09]);
      const emblemColor = hdr(PALETTE.mint, 3.4);
      this.emblemMat = kit.own(new THREE.MeshBasicMaterial({ color: emblemColor }));
      const dotGeo = new THREE.CircleGeometry(0.0082, 12);
      const emblem = new THREE.InstancedMesh(dotGeo, this.emblemMat, dots.length);
      dots.forEach(([dx, dy], i) => {
        _m.makeTranslation(dx, 0.43 + dy, 0.205 - Math.abs(dx) * 0.25);
        emblem.setMatrixAt(i, _m);
      });
      this.spine.add(emblem);
    }

    // --- neck + head ---------------------------------------------------------
    this.neck.position.y = 0.67;
    this.spine.add(this.neck);
    mesh(capsule(0.05, 0.09), joint, this.neck, 0, 0.055, 0);
    const neckRing = mesh(torus(0.054, 0.005), ring, this.neck, 0, 0.07, 0);
    neckRing.rotation.x = Math.PI / 2;
    this.head.position.y = 0.13;
    // A slightly oversized head keeps the LED face legible from the hero distance.
    this.head.scale.setScalar(1.16);
    this.neck.add(this.head);
    const helmet = mesh(ball(0.15), shell, this.head, 0, 0.1, 0);
    helmet.scale.set(1, 1.16, 1.04);
    const visorGeo = new THREE.SphereGeometry(
      0.1528,
      hi ? 48 : 24,
      hi ? 24 : 12,
      Math.PI / 2 - 0.98,
      1.96,
      Math.PI / 2 - 0.5,
      1.0,
    );
    const visor = mesh(visorGeo, kit.visor(), this.head, 0, 0.1, 0);
    visor.scale.set(1, 1.16, 1.04);
    for (const side of [-1, 1]) {
      const pod = mesh(
        new THREE.CylinderGeometry(0.046, 0.05, 0.04, seg),
        shell,
        this.head,
        side * 0.152,
        0.1,
        -0.01,
      );
      pod.rotation.z = Math.PI / 2;
      const podRing = mesh(torus(0.036, 0.0045), ring, this.head, side * 0.174, 0.1, -0.01);
      podRing.rotation.y = Math.PI / 2;
    }
    if (opts.antenna) {
      mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), joint, this.head, 0.05, 0.31, -0.02);
      mesh(ball(0.016), kit.glow(opts.eye ?? PALETTE.violet, 4), this.head, 0.05, 0.375, -0.02);
    }

    // LED dot-matrix eyes, projected onto the curved visor.
    const dotGeo = new THREE.CircleGeometry(0.0062, 12);
    const eyeMat = kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.eyeMesh = new THREE.InstancedMesh(dotGeo, eyeMat, EYE_COLS * EYE_ROWS * 2);
    for (let i = 0; i < this.eyeMesh.count; i++) this.eyeMesh.setColorAt(i, this.eyeColor);
    this.head.add(this.eyeMesh);

    // --- arms ----------------------------------------------------------------
    const L1 = 0.33;
    const L2 = 0.31;
    this.arms = [new Arm(-1, L1, L2), new Arm(1, L1, L2)];
    for (const arm of this.arms) {
      const side = arm.side;
      arm.shoulder.position.set(side * 0.345, 0.52, 0);
      this.spine.add(arm.shoulder);
      mesh(ball(0.096), joint, arm.shoulder);
      const cap = mesh(
        new THREE.SphereGeometry(0.12, seg, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        shell,
        arm.shoulder,
      );
      cap.position.set(side * 0.012, 0.012, 0);
      cap.rotation.z = -side * 0.38;
      const shoulderRing = mesh(torus(0.104, 0.005), ring, arm.shoulder, side * 0.03, -0.008, 0);
      shoulderRing.rotation.set(Math.PI / 2, side * 0.38, 0);
      mesh(capsule(0.069, 0.18), shell, arm.upper, 0, -L1 / 2, 0);
      mesh(capsule(0.0055, 0.11), strip, arm.upper, side * 0.064, -L1 / 2, 0.02);
      mesh(ball(0.061), joint, arm.elbow);
      const er = mesh(torus(0.064, 0.0055), ring, arm.elbow);
      er.rotation.y = Math.PI / 2;
      mesh(capsule(0.059, 0.17), shell, arm.elbow, 0, -L2 / 2, 0);
      mesh(ball(0.039), joint, arm.wrist);
      if (hi) {
        mesh(new RoundedBoxGeometry(0.09, 0.1, 0.04, 3, 0.015), shell, arm.hand, 0, -0.064, 0);
        [-0.031, -0.0105, 0.0105, 0.031].forEach((fx) => {
          const base = new THREE.Group();
          base.position.set(fx, -0.114, 0);
          arm.hand.add(base);
          mesh(capsule(0.0108, 0.028), shell, base, 0, -0.017, 0);
          const mid = new THREE.Group();
          mid.position.y = -0.038;
          base.add(mid);
          mesh(capsule(0.0098, 0.022), shell, mid, 0, -0.014, 0);
          arm.fingers.push({ base, mid });
        });
        const thumb = new THREE.Group();
        thumb.position.set(-side * 0.046, -0.052, 0.014);
        thumb.rotation.z = -side * 0.55;
        arm.hand.add(thumb);
        mesh(capsule(0.012, 0.034), shell, thumb, 0, -0.024, 0);
        arm.thumb = thumb;
      } else {
        mesh(new RoundedBoxGeometry(0.075, 0.13, 0.04, 2, 0.02), shell, arm.hand, 0, -0.07, 0);
      }
      arm.setFingers(0.3);
    }

    this.root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = false;
    });
    this.setExpression("neutral");
  }

  /** World position of the head centre, for hover tests and camera framing. */
  headWorldPosition(target = new THREE.Vector3()) {
    return this.head.localToWorld(target.set(0, 0.1, 0));
  }

  /** Track a world-space point with the head (null = idle look-around). */
  lookAt(point: THREE.Vector3 | null) {
    this.looking = point !== null;
    if (point) this.lookPoint.copy(point);
  }

  /** Reach toward a world point with one arm (0 = robot's right, 1 = robot's left). */
  reach(index: 0 | 1, point: THREE.Vector3 | null, weight: number) {
    const arm = this.arms[index];
    if (point) {
      arm.target.copy(point);
      arm.hasTarget = true;
    }
    arm.targetWeight = point ? weight : 0;
  }

  /** Wave hello with the screen-right hand and smile. */
  greet(duration = 2.4) {
    if (this.waveLeft <= 0) this.waveLeft = duration;
  }

  get isGreeting() {
    return this.waveLeft > 0;
  }

  setMood(expression: Expression) {
    this.moodExpression = expression;
  }

  setWorkAnchors(left: THREE.Vector3, right: THREE.Vector3) {
    this.workAnchors[0].copy(right);
    this.workAnchors[1].copy(left);
    this.working = true;
  }

  private setExpression(expression: Expression) {
    this.expression = expression;
  }

  private layoutEyes() {
    const mask = EYE_MASKS[this.expression];
    // Visor ellipsoid radii (matches the visor mesh scale) and centre.
    const a = 0.1528;
    const b = 0.1528 * 1.16;
    const c = 0.1528 * 1.04;
    const cy = 0.1;
    let i = 0;
    for (const eye of [-1, 1]) {
      const ex = eye * 0.046 + this.gazeX;
      const ey = cy + 0.004 + this.gazeY;
      for (let r = 0; r < EYE_ROWS; r++) {
        for (let col = 0; col < EYE_COLS; col++) {
          const on = mask[r][col] === "#";
          const x = ex + (col - (EYE_COLS - 1) / 2) * DOT_STEP;
          const y = ey + ((EYE_ROWS - 1) / 2 - r) * DOT_STEP;
          const k = 1 - (x / a) ** 2 - ((y - cy) / b) ** 2;
          const z = c * Math.sqrt(Math.max(k, 0.0001)) + 0.0022;
          _normal.set(x / (a * a), (y - cy) / (b * b), z / (c * c)).normalize();
          _q.setFromUnitVectors(FORWARD, _normal);
          _s.setScalar(on ? 1 : 0.0001);
          _m.compose(_v.set(x, y, z), _q, _s);
          this.eyeMesh.setMatrixAt(i++, _m);
        }
      }
    }
    this.eyeMesh.instanceMatrix.needsUpdate = true;
  }

  update(dt: number, t: number) {
    const breath = Math.sin(t * 1.6 + this.phase);
    this.spine.position.y = 0.08 + breath * 0.0035;
    this.torso.scale.set(1.25 * (1 + breath * 0.005), 1, 0.74 * (1 + breath * 0.012));
    this.spine.rotation.x = damp(this.spine.rotation.x, this.slump * 0.42, 3, dt);

    // --- gaze ---------------------------------------------------------------
    let targetYaw = 0;
    let targetPitch = 0;
    if (this.looking) {
      _v.copy(this.lookPoint);
      this.root.worldToLocal(_v);
      _v.y -= 2.0;
      targetYaw = Math.atan2(_v.x, Math.max(_v.z, 0.05));
      targetPitch = Math.atan2(_v.y, Math.hypot(_v.x, _v.z));
    } else {
      targetYaw = Math.sin(t * 0.31 + this.phase) * 0.45;
      targetPitch = Math.sin(t * 0.47 + this.phase * 2) * 0.12 - this.slump * 0.3;
    }
    targetYaw = clamp(targetYaw, -0.85, 0.85);
    targetPitch = clamp(targetPitch, -0.55, 0.6);
    this.yaw = damp(this.yaw, targetYaw, 7, dt);
    this.pitch = damp(this.pitch, targetPitch, 7, dt);
    this.spine.rotation.y = this.yaw * 0.2;
    this.neck.rotation.y = this.yaw * 0.28;
    this.head.rotation.y = this.yaw * 0.52;
    this.neck.rotation.x = -this.pitch * 0.35 + this.slump * 0.25;
    this.head.rotation.x = -this.pitch * 0.62 + this.slump * 0.2;
    this.head.rotation.z = -this.yaw * 0.07;
    this.gazeX = damp(this.gazeX, clamp(targetYaw - this.yaw * 0.9, -0.4, 0.4) * 0.018, 12, dt);
    this.gazeY = damp(this.gazeY, clamp(targetPitch - this.pitch * 0.9, -0.4, 0.4) * 0.014, 12, dt);

    // --- expression: blink on a timer, smile while greeting -------------------
    this.blinkIn -= dt;
    if (this.blinkIn <= 0) {
      this.blinkLeft = 0.13;
      this.blinkIn = 2.2 + Math.random() * 3.8;
    }
    this.blinkLeft -= dt;
    this.waveLeft = Math.max(0, this.waveLeft - dt);
    const wanted: Expression =
      this.blinkLeft > 0 ? "blink" : this.waveLeft > 0 ? "happy" : this.moodExpression;
    if (wanted !== this.expression) this.setExpression(wanted);
    this.layoutEyes();
    if (this.shown !== this.expression) this.shown = this.expression;

    if (this.emblemMat) {
      this.emblemMat.color.copy(hdr(PALETTE.mint, 2.6 + Math.sin(t * 2.1) * 0.9));
    }

    // --- arms -----------------------------------------------------------------
    this.root.updateMatrixWorld(true);
    const waveArm = this.arms[Robot.LEFT];
    if (this.waveLeft > 0) {
      const env = Math.min(1, this.waveLeft / 0.35, (2.4 - this.waveLeft) / 0.3 + 0.2);
      _v.set(0.44, 1.98 + Math.sin(t * 9) * 0.035, 0.22);
      waveArm.target.copy(this.root.localToWorld(_v));
      waveArm.hasTarget = true;
      waveArm.weight = damp(waveArm.weight, clamp(env), 10, dt);
      waveArm.wrist.rotation.z = Math.sin(t * 11) * 0.55 * waveArm.weight;
      waveArm.open = 1;
    } else {
      waveArm.wrist.rotation.z = damp(waveArm.wrist.rotation.z, 0, 8, dt);
    }

    this.arms.forEach((arm, idx) => {
      if (this.working) {
        const anchor = this.workAnchors[idx];
        _v.copy(anchor);
        _v.x += Math.sin(t * 7.3 + idx * 1.9 + this.phase) * 0.035;
        _v.y += Math.max(0, Math.sin(t * 9.1 + idx * 2.3 + this.phase)) * 0.04;
        arm.target.copy(this.root.localToWorld(_v));
        arm.hasTarget = true;
        arm.targetWeight = 0.95;
        arm.open = 0.75;
      }
      if (!(idx === Robot.LEFT && this.waveLeft > 0)) {
        arm.weight = damp(arm.weight, arm.targetWeight, 5, dt);
        arm.open = lerp(0.28, 0.95, arm.weight);
      }
      arm.solve(arm.weight);
      arm.setFingers(arm.open);
    });
  }
}
