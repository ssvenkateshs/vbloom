import * as THREE from "three";
import { PALETTE, curveThrough, hdr, rng, smoothstep } from "../kit";
import { Robot } from "../robot";
import type { SceneBuilder } from "./types";

const SOURCES = [
  { label: "DOCUMENTS", color: 0xdfe4ff },
  { label: "TRANSACTIONS", color: PALETTE.amber },
  { label: "WORKFLOWS", color: PALETTE.cyan },
  { label: "EMAILS", color: PALETTE.plasma },
  { label: "IMAGES", color: PALETTE.mint },
];

/**
 * 03 Transform: "From information to intelligence".
 * An AI core powers up; streams of data spiral in from documents, transactions,
 * workflows, emails and images; a digital seed appears at its heart.
 */
export const buildTransform: SceneBuilder = ({ kit, island, reducedMotion }) => {
  const stage = island.stage;
  const random = rng(303);
  const corePos = new THREE.Vector3(0, 3.6, -0.6);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 1.2, 40), kit.structure());
  pedestal.position.set(corePos.x, 0.6, corePos.z);
  stage.add(pedestal);
  const pedestalRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 8, 80), kit.glow(PALETTE.violet, 3));
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.set(corePos.x, 1.22, corePos.z);
  stage.add(pedestalRing);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.25, corePos.y - 1.2, 16, 1, true),
    kit.glow(PALETTE.violet, 1.6, { opacity: 0.35, additive: true }),
  );
  beam.position.set(corePos.x, (corePos.y + 1.2) / 2, corePos.z);
  stage.add(beam);

  const core = new THREE.Group();
  core.position.copy(corePos);
  stage.add(core);
  const heartMat = kit.own(new THREE.MeshBasicMaterial({ color: hdr(PALETTE.violet, 3) }));
  const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 3), heartMat);
  core.add(heart);
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.25, 1)),
    kit.own(new THREE.LineBasicMaterial({ color: hdr(0xb4a8ff, 1.8), transparent: true, opacity: 0.8 })),
  );
  core.add(shell);
  const rings = [0, 1, 2].map((i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75 + i * 0.28, 0.015, 6, 120), kit.glow(i === 1 ? PALETTE.cyan : PALETTE.violet, 2.6));
    ring.rotation.set(Math.PI / 2 + i * 0.7, i * 0.9, 0);
    core.add(ring);
    return ring;
  });
  const coreHalo = kit.halo(PALETTE.violet, 7, 0.3);
  core.add(coreHalo);

  // Neuron cloud: points on a sphere that pulse with the core.
  const NEURONS = kit.lowPower ? 140 : 260;
  const neurons = kit.particles(NEURONS);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NEURONS; i++) {
    const y = 1 - (i / (NEURONS - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    neurons.positions.set([Math.cos(golden * i) * r * 1.5, y * 1.5, Math.sin(golden * i) * r * 1.5], i * 3);
    const c = new THREE.Color(random() < 0.7 ? PALETTE.violet : PALETTE.cyan).multiplyScalar(2);
    neurons.colors.set([c.r, c.g, c.b], i * 3);
    neurons.sizes[i] = 0.08 + random() * 0.08;
  }
  neurons.commit();
  core.add(neurons);

  // The digital seed: where the bloom begins.
  const seed = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), kit.glow(PALETTE.mint, 4.5));
  seed.scale.set(0.8, 1.25, 0.8);
  core.add(seed);

  // Data sources and their spiralling streams.
  const PER_STREAM = kit.lowPower ? 26 : 46;
  const streams = kit.particles(SOURCES.length * PER_STREAM);
  const curves = SOURCES.map((source, i) => {
    const a = (i / SOURCES.length) * Math.PI * 2 + 0.35;
    const base = new THREE.Vector3(Math.cos(a) * 6.4, 0, Math.sin(a) * 5.4 - 0.6);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.7), kit.structure());
    pylon.position.set(base.x, 0.55, base.z);
    stage.add(pylon);
    const glyph = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), kit.glow(source.color, 3));
    glyph.position.set(base.x, 1.55, base.z);
    stage.add(glyph);
    const label = kit.label(source.label, source.color, 0.3);
    label.position.set(base.x, 2.3, base.z);
    stage.add(label);
    const mid = base.clone().lerp(corePos, 0.5);
    mid.y = 4.4 + (i % 2) * 0.8;
    const swirl = new THREE.Vector3(-(corePos.z - base.z), 0, corePos.x - base.x).normalize().multiplyScalar(1.6);
    const color = new THREE.Color(source.color).multiplyScalar(2.6);
    for (let k = 0; k < PER_STREAM; k++) {
      const idx = i * PER_STREAM + k;
      streams.colors.set([color.r, color.g, color.b], idx * 3);
      streams.sizes[idx] = 0.1 + random() * 0.07;
    }
    return { curve: curveThrough([glyph.position.clone(), mid.add(swirl), corePos.clone().add(new THREE.Vector3(0, 0.2, 0))]), glyph };
  });
  stage.add(streams);

  const robots = [-1, 1].map((side, i) => {
    const robot = new Robot(kit, { detail: "low", eye: PALETTE.violet, seed: 20 + i });
    robot.root.position.set(side * 2.6, 0, 1.8);
    robot.root.rotation.y = -side * 0.7;
    stage.add(robot.root);
    return robot;
  });
  const coreWorld = new THREE.Vector3();

  return {
    hold: new THREE.Vector3(4.8, 5.4, 14.5),
    focus: new THREE.Vector3(0, 3, -0.6),
    update(dt, t, intro) {
      const motion = reducedMotion ? 0.2 : 1;
      const power = smoothstep(0, 0.6, intro);
      const learn = smoothstep(0.2, 0.7, intro);
      const pulse = 1 + Math.sin(t * 2.4) * 0.06 * power;
      core.scale.setScalar((0.55 + 0.45 * power) * pulse);
      heartMat.color.copy(hdr(PALETTE.violet, 0.8 + 2.6 * power + Math.sin(t * 2.4) * 0.4 * power));
      shell.rotation.set(t * 0.12 * motion, t * 0.2 * motion, 0);
      rings.forEach((ring, i) => (ring.rotation.z = t * (0.25 + i * 0.12) * (i % 2 ? -1 : 1) * motion));
      coreHalo.material.opacity = 0.08 + 0.3 * power;
      neurons.material.uniforms.uOpacity.value = 0.25 + 0.75 * power * (0.7 + 0.3 * Math.sin(t * 3.1));
      neurons.rotation.y = t * 0.1 * motion;
      const seedIn = smoothstep(0.75, 1, intro);
      seed.scale.set(0.8 * seedIn, 1.25 * seedIn, 0.8 * seedIn);
      seed.rotation.y = t;

      curves.forEach(({ curve, glyph }, i) => {
        glyph.rotation.y = t * 0.8 * motion;
        for (let k = 0; k < PER_STREAM; k++) {
          const idx = i * PER_STREAM + k;
          const frac = (t * 0.16 * motion + k / PER_STREAM) % 1;
          const p = curve.getPoint(frac);
          streams.positions.set([p.x, p.y, p.z], idx * 3);
          streams.alphas[idx] = learn * Math.sin(frac * Math.PI);
        }
      });
      streams.commit();

      stage.localToWorld(coreWorld.copy(corePos));
      robots.forEach((robot) => {
        robot.lookAt(coreWorld);
        robot.reach(Robot.LEFT, coreWorld, learn * 0.6);
        robot.reach(Robot.RIGHT, coreWorld, learn * 0.6);
        robot.update(dt, t);
      });
    },
  };
};
