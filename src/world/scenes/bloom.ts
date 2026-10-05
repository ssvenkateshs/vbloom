import * as THREE from "three";
import { PALETTE, clamp, curveThrough, rng, smoothstep } from "../kit";
import { Robot } from "../robot";
import type { SceneBuilder } from "./types";

const BRANCHES = ["AI", "DATA", "CLOUD", "AUTOMATION", "APPLICATIONS", "ANALYTICS"];
const BRANCH_COLORS = [
  PALETTE.violet,
  PALETTE.cyan,
  PALETTE.mint,
  PALETTE.plasma,
  PALETTE.teal,
  PALETTE.amber,
];

/**
 * 06 Bloom: "From complexity to clarity".
 * A seed becomes a neon tree whose six branches are the capabilities, blossoms open,
 * a bloom wave rolls across the island and its rim turns from violet to teal.
 */
export const buildBloom: SceneBuilder = ({ kit, island }) => {
  const stage = island.stage;
  const random = rng(606);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const trunkPoints = [V(0, 0, 0), V(0.15, 0.9, 0.05), V(-0.1, 1.8, 0), V(0.05, 2.7, -0.05)];
  const trunk = kit.tube(curveThrough(trunkPoints), {
    radius: 0.1,
    color: PALETTE.violetDeep,
    colorEnd: PALETTE.mint,
    intensity: 1.4,
    head: 1.5,
    progress: 0,
    segments: 64,
    radial: 10,
  });
  stage.add(trunk);

  type Branch = { tube: ReturnType<typeof kit.tube>; start: number; end: number };
  const branches: Branch[] = [];
  const tips: { pos: THREE.Vector3; orb: THREE.Mesh; label: THREE.Sprite }[] = [];
  const blossomSites: THREE.Vector3[] = [];

  BRANCHES.forEach((name, i) => {
    const az = (i / BRANCHES.length) * Math.PI * 2 + 0.3;
    const base = V(0, 1.9 + (i % 3) * 0.3, 0);
    const dir = V(Math.cos(az), 0.38 + random() * 0.18, Math.sin(az)).normalize();
    const mid = base
      .clone()
      .addScaledVector(dir, 1.3)
      .add(V(0, 0.45, 0));
    const tip = base
      .clone()
      .addScaledVector(dir, 2.8)
      .add(V(0, 0.7, 0));
    const tube = kit.tube(curveThrough([base, mid, tip]), {
      radius: 0.05,
      color: PALETTE.mint,
      colorEnd: BRANCH_COLORS[i],
      intensity: 1.6,
      head: 1.5,
      progress: 0,
      segments: 48,
    });
    stage.add(tube);
    branches.push({ tube, start: 0.22 + i * 0.03, end: 0.55 + i * 0.03 });

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), kit.glow(BRANCH_COLORS[i], 2.6));
    orb.position.copy(tip);
    stage.add(orb);
    const label = kit.label(name, BRANCH_COLORS[i], 0.3);
    label.position.copy(tip).add(V(0, 0.52, 0));
    stage.add(label);
    tips.push({ pos: tip, orb, label });

    // Two twigs per branch carry the blossoms.
    for (const k of [-1, 1]) {
      const twigDir = dir.clone().applyAxisAngle(V(0, 1, 0), k * 0.7);
      const from = base.clone().lerp(tip, 0.55);
      const to = from
        .clone()
        .addScaledVector(twigDir, 0.9)
        .add(V(0, 0.45, 0));
      const twig = kit.tube(
        curveThrough([
          from,
          from
            .clone()
            .lerp(to, 0.5)
            .add(V(0, 0.15, 0)),
          to,
        ]),
        {
          radius: 0.03,
          color: PALETTE.mint,
          colorEnd: BRANCH_COLORS[i],
          intensity: 1.4,
          head: 1.2,
          progress: 0,
          segments: 24,
        },
      );
      stage.add(twig);
      branches.push({ tube: twig, start: 0.45 + i * 0.03, end: 0.7 + i * 0.03 });
      blossomSites.push(to);
    }
    blossomSites.push(tip);
  });

  // Blossoms clustered around the tips, and petals drifting away.
  const BLOSSOMS = kit.lowPower ? 220 : 420;
  const blossoms = kit.particles(BLOSSOMS);
  const blossomBase: THREE.Vector3[] = [];
  const palette = [PALETTE.mint, PALETTE.teal, PALETTE.plasma, PALETTE.violet, 0xffd6f5];
  for (let i = 0; i < BLOSSOMS; i++) {
    const site = blossomSites[i % blossomSites.length];
    const p = site.clone().add(V((random() - 0.5) * 0.9, (random() - 0.3) * 0.7, (random() - 0.5) * 0.9));
    blossomBase.push(p);
    const c = new THREE.Color(palette[Math.floor(random() * palette.length)]).multiplyScalar(1.5);
    blossoms.colors.set([c.r, c.g, c.b], i * 3);
    blossoms.sizes[i] = 0.08 + random() * 0.14;
  }
  stage.add(blossoms);

  // The bloom wave: flowers opening across the platform from the tree outward.
  const FLOWERS = kit.lowPower ? 260 : 520;
  const flowers = kit.particles(FLOWERS);
  const flowerRadius = new Float32Array(FLOWERS);
  for (let i = 0; i < FLOWERS; i++) {
    const r = 1.4 + Math.sqrt(random()) * 7.2;
    const a = random() * Math.PI * 2;
    flowerRadius[i] = r;
    flowers.positions.set([Math.cos(a) * r, 0.08, Math.sin(a) * r], i * 3);
    const c = new THREE.Color(palette[Math.floor(random() * 3)]).multiplyScalar(1.8);
    flowers.colors.set([c.r, c.g, c.b], i * 3);
    flowers.sizes[i] = 0.1 + random() * 0.12;
  }
  flowers.commit();
  stage.add(flowers);

  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), kit.glow(PALETTE.mint, 4.2));
  seed.scale.set(0.85, 1.2, 0.85);
  seed.position.y = 0.2;
  stage.add(seed);
  const seedHalo = kit.halo(PALETTE.mint, 2.4, 0.5);
  seedHalo.position.y = 0.3;
  stage.add(seedHalo);
  const crownHalo = kit.halo(PALETTE.teal, 9, 0);
  crownHalo.position.y = 3.4;
  stage.add(crownHalo);

  const robot = new Robot(kit, { detail: "high", eye: PALETTE.mint, accent: PALETTE.teal, seed: 60 });
  robot.root.position.set(-2.4, 0, 2.6);
  robot.root.rotation.y = 0.6;
  stage.add(robot.root);
  const crown = new THREE.Vector3();
  const rimFrom = new THREE.Color(PALETTE.violet);
  const rimTo = new THREE.Color(PALETTE.teal);
  const rim = new THREE.Color();
  let lastRim = -1;

  return {
    hold: new THREE.Vector3(5.5, 4.6, 13.5),
    focus: new THREE.Vector3(0, 2.7, 0),
    update(dt, t, intro) {
      const g = intro;
      const seedPhase = 1 - smoothstep(0.08, 0.3, g);
      seed.scale.set(0.85 * (0.4 + seedPhase), 1.2 * (0.4 + seedPhase), 0.85 * (0.4 + seedPhase));
      seedHalo.material.opacity = 0.15 + 0.4 * seedPhase + 0.1 * Math.sin(t * 3);
      trunk.setProgress(smoothstep(0.04, 0.3, g));
      for (const b of branches) b.tube.setProgress(smoothstep(b.start, b.end, g));
      const open = smoothstep(0.62, 0.95, g);
      tips.forEach((tip, i) => {
        const s = smoothstep(0.55 + i * 0.03, 0.72 + i * 0.03, g);
        tip.orb.scale.setScalar(Math.max(0.001, s * (1 + Math.sin(t * 2 + i) * 0.08)));
        tip.label.material.opacity = s;
        tip.label.visible = s > 0.01;
      });
      for (let i = 0; i < BLOSSOMS; i++) {
        const b = blossomBase[i];
        const drift = (t * 0.05 + i * 0.013) % 1;
        const loose = i % 7 === 0 ? drift : 0;
        blossoms.positions.set(
          [
            b.x + Math.sin(t * 0.8 + i) * 0.05 + loose * 1.6,
            b.y - loose * 2.2 + Math.sin(t + i) * 0.04,
            b.z + loose * 0.8,
          ],
          i * 3,
        );
        blossoms.alphas[i] = open * (loose ? 1 - drift : 1);
      }
      blossoms.commit();
      const wave = smoothstep(0.55, 1, g) * 9.5;
      for (let i = 0; i < FLOWERS; i++) flowers.alphas[i] = clamp((wave - flowerRadius[i]) / 1.2);
      flowers.commit();
      crownHalo.material.opacity = 0.1 * open;

      const k = smoothstep(0.6, 1, g);
      if (Math.abs(k - lastRim) > 0.01) {
        island.setRim(rim.copy(rimFrom).lerp(rimTo, k).getHex());
        lastRim = k;
      }

      robot.lookAt(stage.localToWorld(crown.set(0, 3.2, 0)));
      robot.reach(Robot.LEFT, open > 0.1 ? crown : null, open * 0.7);
      robot.setMood(g > 0.85 ? "happy" : "neutral");
      robot.update(dt, t);
    },
  };
};
