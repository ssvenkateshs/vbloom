import * as THREE from "three";
import { PALETTE, arcBetween, clamp, rng, smoothstep } from "../kit";
import { Robot } from "../robot";
import { tmpObject } from "./shared";
import type { SceneBuilder } from "./types";

const SYSTEMS = [
  { label: "ERP", color: PALETTE.violet },
  { label: "CRM", color: PALETTE.cyan },
  { label: "FINANCE", color: PALETTE.amber },
  { label: "PROJECTS", color: PALETTE.plasma },
  { label: "DOCUMENTS", color: 0xdfe4ff },
  { label: "MOBILE", color: PALETTE.mint },
];

/**
 * 02 Connect: "What if everything worked together?"
 * Isolated system planets; on arrival light links draw in one by one, first around
 * the ring and then into a central hub, and data packets start to flow.
 */
export const buildConnect: SceneBuilder = ({ kit, island, reducedMotion }) => {
  const stage = island.stage;
  const random = rng(202);
  const hubPos = new THREE.Vector3(0, 3.4, -0.4);

  const nodes = SYSTEMS.map((system, i) => {
    const a = (i / SYSTEMS.length) * Math.PI * 2 + Math.PI / 6;
    const height = 1.6 + (i % 3) * 0.6;
    const pos = new THREE.Vector3(Math.cos(a) * 5.4, height, Math.sin(a) * 4.6 - 0.4);
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.34, height - 0.7, 16),
      kit.structure(),
    );
    pedestal.position.set(pos.x, (height - 0.7) / 2, pos.z);
    stage.add(pedestal);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 24), kit.shell("low"));
    planet.position.copy(pos);
    stage.add(planet);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.02, 8, 64), kit.glow(system.color, 2.6));
    ring.position.copy(pos);
    ring.rotation.set(Math.PI / 2 + 0.4, random(), 0);
    stage.add(ring);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), kit.glow(system.color, 3));
    core.position.copy(pos);
    stage.add(core);
    const label = kit.label(system.label, system.color, 0.36);
    label.position.set(pos.x, pos.y + 1.2, pos.z);
    stage.add(label);
    return { pos, ring, core, label };
  });

  const hub = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), kit.glow(PALETTE.violet, 2.4));
  hub.position.copy(hubPos);
  stage.add(hub);
  const hubShell = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.05, 0),
    kit.own(
      new THREE.MeshBasicMaterial({ color: 0xb4a8ff, wireframe: true, transparent: true, opacity: 0.35 }),
    ),
  );
  hubShell.position.copy(hubPos);
  stage.add(hubShell);
  const hubHalo = kit.halo(PALETTE.violet, 4.5, 0.25);
  hubHalo.position.copy(hubPos);
  stage.add(hubHalo);

  // Links: the ring first, then spokes into the hub.
  type Link = { tube: ReturnType<typeof kit.tube>; curve: THREE.Curve<THREE.Vector3>; start: number };
  const links: Link[] = [];
  nodes.forEach((node, i) => {
    const next = nodes[(i + 1) % nodes.length];
    const curve = arcBetween(node.pos, next.pos, 1.1);
    const tube = kit.tube(curve, {
      color: SYSTEMS[i].color,
      colorEnd: SYSTEMS[(i + 1) % nodes.length].color,
      radius: 0.03,
      dash: 7,
      speed: 0.5,
      progress: 0,
    });
    stage.add(tube);
    links.push({ tube, curve, start: i * 0.07 });
  });
  nodes.forEach((node, i) => {
    const curve = arcBetween(node.pos, hubPos, 0.9);
    const tube = kit.tube(curve, {
      color: SYSTEMS[i].color,
      colorEnd: PALETTE.violet,
      radius: 0.026,
      dash: 6,
      speed: 0.8,
      progress: 0,
    });
    stage.add(tube);
    links.push({ tube, curve, start: 0.45 + i * 0.05 });
  });

  const PACKETS_PER_LINK = 3;
  const packets = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.075, 10, 8),
    kit.glow(0xffffff, 4),
    links.length * PACKETS_PER_LINK,
  );
  stage.add(packets);

  const robot = new Robot(kit, { detail: "low", eye: PALETTE.cyan, accent: PALETTE.cyan, seed: 11 });
  robot.root.position.set(1.2, 0, 2.2);
  robot.root.rotation.y = -0.5;
  stage.add(robot.root);
  const hubWorld = new THREE.Vector3();

  return {
    hold: new THREE.Vector3(-4.5, 6, 14),
    focus: new THREE.Vector3(0, 2.6, -0.4),
    update(dt, t, intro) {
      const motion = reducedMotion ? 0.2 : 1;
      links.forEach((link, li) => {
        const progress = clamp((intro * 1.25 - link.start) / 0.3);
        link.tube.setProgress(progress);
        for (let k = 0; k < PACKETS_PER_LINK; k++) {
          const frac = (t * 0.22 * motion + k / PACKETS_PER_LINK + li * 0.13) % 1;
          if (progress >= 1) link.curve.getPoint(frac, tmpObject.position);
          tmpObject.scale.setScalar(progress >= 1 ? 1 : 0.0001);
          tmpObject.rotation.set(0, 0, 0);
          tmpObject.updateMatrix();
          packets.setMatrixAt(li * PACKETS_PER_LINK + k, tmpObject.matrix);
        }
      });
      packets.instanceMatrix.needsUpdate = true;

      const connected = smoothstep(0.55, 0.95, intro);
      hub.rotation.y = t * 0.6 * motion;
      hubShell.rotation.y = -t * 0.3 * motion;
      hub.scale.setScalar(0.6 + 0.4 * connected + Math.sin(t * 3) * 0.04 * connected);
      hubHalo.material.opacity = 0.08 + 0.3 * connected;
      nodes.forEach((n, i) => {
        n.ring.rotation.z = t * (0.3 + i * 0.05) * motion;
        n.core.scale.setScalar(0.7 + 0.5 * connected);
      });

      // The robot reaches up into the hub as the network completes.
      robot.lookAt(stage.localToWorld(hubWorld.copy(hubPos)));
      robot.reach(Robot.LEFT, connected > 0.05 ? hubWorld : null, connected * 0.85);
      robot.setMood(connected > 0.9 ? "happy" : "focus");
      robot.update(dt, t);
    },
  };
};
