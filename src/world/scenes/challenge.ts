import * as THREE from "three";
import { PALETTE, arcBetween, clamp, hdr, rng, smoothstep } from "../kit";
import { Robot } from "../robot";
import { sheetTexture, tmpObject, warningSprite } from "./shared";
import type { SceneBuilder } from "./types";

/**
 * 01 Challenge: "Every business is drowning in complexity".
 * Isolated server monoliths, tangled red cables, a storm of emails and spreadsheets,
 * flashing warnings, and an overwhelmed robot in the middle of it all.
 */
export const buildChallenge: SceneBuilder = ({ kit, island, reducedMotion }) => {
  const stage = island.stage;
  const random = rng(101);

  // Siloed systems, each flickering on its own.
  const monoliths: { strip: THREE.MeshBasicMaterial; beacon: THREE.Mesh; phase: number }[] = [];
  const anchors: THREE.Vector3[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const h = 2 + random() * 1.4;
    const x = Math.cos(a) * 5.4;
    const z = Math.sin(a) * 4.6 - 0.6;
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.25, h, 1.25), kit.structure());
    block.position.set(x, h / 2, z);
    block.rotation.y = random() * 0.6;
    stage.add(block);
    const strip = kit.own(new THREE.MeshBasicMaterial({ color: hdr(PALETTE.red, 2) }));
    const stripMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.02), strip);
    stripMesh.position.set(0, h * 0.2, 0.63);
    block.add(stripMesh);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), kit.glow(PALETTE.red, 4));
    beacon.position.set(x, h + 0.2, z);
    stage.add(beacon);
    monoliths.push({ strip, beacon, phase: random() * 10 });
    anchors.push(new THREE.Vector3(x, 0.6, z));
  }

  // Tangled cables between systems that don't talk to each other properly.
  const cables = [
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 0],
    [4, 1],
    [0, 1],
  ].map(([a, b], i) => {
    const tube = kit.tube(arcBetween(anchors[a], anchors[b], i % 2 ? 1.6 : -0.3), {
      radius: 0.035,
      color: i % 3 === 0 ? PALETTE.amber : PALETTE.red,
      intensity: 1.6,
      dash: 9,
      speed: 0.9,
      head: 0,
    });
    stage.add(tube);
    return tube;
  });

  // The paper storm: spreadsheets and envelopes whirling around the island.
  const SHEETS = kit.lowPower ? 50 : 90;
  const MAILS = kit.lowPower ? 34 : 64;
  const sheets = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.5, 0.66),
    kit.own(
      new THREE.MeshBasicMaterial({
        map: sheetTexture(kit),
        side: THREE.DoubleSide,
        color: hdr(0xffffff, 0.9),
      }),
    ),
    SHEETS,
  );
  const mails = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.56, 0.36, 0.03),
    kit.own(new THREE.MeshBasicMaterial({ color: hdr(0xd9def5, 0.85) })),
    MAILS,
  );
  stage.add(sheets, mails);
  const flock = Array.from({ length: SHEETS + MAILS }, () => ({
    radius: 2.4 + random() * 6.4,
    height: 1 + random() * 6,
    speed: (0.25 + random() * 0.55) * (random() < 0.25 ? -1 : 1),
    phase: random() * Math.PI * 2,
    spin: new THREE.Vector3(random(), random(), random()).multiplyScalar(2.5),
  }));

  const warnings = Array.from({ length: 7 }, (_, i) => {
    const sprite = warningSprite(kit, 0.8);
    const a = (i / 7) * Math.PI * 2;
    sprite.position.set(Math.cos(a) * 4, 2.5 + random() * 3, Math.sin(a) * 3.5);
    stage.add(sprite);
    return { sprite, base: sprite.position.y, phase: random() * 10 };
  });

  const robot = new Robot(kit, {
    detail: "low",
    eye: PALETTE.red,
    accent: PALETTE.red,
    emblem: false,
    seed: 7,
  });
  robot.root.position.set(0, 0, 0.8);
  robot.slump = 1;
  robot.setMood("alert");
  stage.add(robot.root);
  const glance = new THREE.Vector3();

  return {
    hold: new THREE.Vector3(4.5, 5.6, 13.5),
    focus: new THREE.Vector3(0, 2.6, 0),
    update(dt, t, intro) {
      const chaos = 0.35 + 0.65 * smoothstep(0, 0.8, intro);
      const motion = reducedMotion ? 0.15 : 1;

      flock.forEach((f, i) => {
        const angle = f.phase + t * f.speed * (0.5 + chaos * 0.9) * motion;
        const r = f.radius + Math.sin(t * 1.3 + f.phase) * 0.7 * chaos;
        tmpObject.position.set(
          Math.cos(angle) * r,
          f.height + Math.sin(t * 0.9 + f.phase) * 0.6,
          Math.sin(angle) * r,
        );
        tmpObject.rotation.set(t * f.spin.x * motion, t * f.spin.y * motion, t * f.spin.z * motion);
        tmpObject.scale.setScalar(clamp(intro * 3 - (i % 10) * 0.08, 0.2, 1));
        tmpObject.updateMatrix();
        if (i < SHEETS) sheets.setMatrixAt(i, tmpObject.matrix);
        else mails.setMatrixAt(i - SHEETS, tmpObject.matrix);
      });
      sheets.instanceMatrix.needsUpdate = true;
      mails.instanceMatrix.needsUpdate = true;

      for (const m of monoliths) {
        const flicker = Math.sin(t * 13 + m.phase) > 0.35 - chaos * 0.3 ? 1 : 0.25;
        m.strip.color.copy(hdr(PALETTE.red, 0.6 + flicker * 1.8 * chaos));
        m.beacon.scale.setScalar(0.8 + Math.abs(Math.sin(t * 4 + m.phase)) * 0.6 * chaos);
      }
      cables.forEach(
        (c, i) => (c.material.uniforms.uOpacity.value = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))),
      );
      warnings.forEach((w, i) => {
        w.sprite.position.y = w.base + Math.sin(t * 1.4 + w.phase) * 0.25;
        w.sprite.material.opacity = intro * (Math.sin(t * 5 + i * 1.7) > -0.2 ? 1 : 0.2);
      });

      // The robot glances frantically from one problem to the next.
      const target = ((Math.floor(t * 1.4) % warnings.length) + warnings.length) % warnings.length;
      glance.copy(warnings[target].sprite.position);
      robot.lookAt(stage.localToWorld(glance));
      robot.update(dt, t);
    },
  };
};
