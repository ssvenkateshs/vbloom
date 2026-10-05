import * as THREE from "three";
import { PALETTE, clamp, hdr, smoothstep } from "../kit";
import { Robot } from "../robot";
import { checkSprite, tmpObject, warningSprite } from "./shared";
import type { SceneBuilder } from "./types";

const BELT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BELT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float chevron = fract(vUv.x * 18.0 - abs(vUv.y - 0.5) * 1.2 - uTime * uSpeed);
    float stripe = smoothstep(0.0, 0.08, chevron) * (1.0 - smoothstep(0.18, 0.3, chevron));
    float edge = smoothstep(0.42, 0.5, abs(vUv.y - 0.5));
    gl_FragColor = vec4(uColor * (stripe * 0.6 + edge * 1.2), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const BELT_START = -6.2;
const BELT_END = 6.2;

/**
 * 04 Automate: "Intelligence that creates outcomes".
 * Documents ride a conveyor through an AI scanning arch and come out as reports;
 * approvals pop, a risk is flagged and resolved, robots work the consoles.
 */
export const buildAutomate: SceneBuilder = ({ kit, island, reducedMotion }) => {
  const stage = island.stage;

  const belt = new THREE.Group();
  belt.position.set(0, 0, 0.6);
  stage.add(belt);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(BELT_END - BELT_START + 0.6, 0.3, 1.6), kit.structure());
  deck.position.y = 0.85;
  belt.add(deck);
  for (const x of [-5.6, -1.9, 1.9, 5.6]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 1.3), kit.structure());
    leg.position.set(x, 0.35, 0);
    belt.add(leg);
  }
  const beltMat = new THREE.ShaderMaterial({
    vertexShader: BELT_VERT,
    fragmentShader: BELT_FRAG,
    uniforms: { uTime: kit.time, uSpeed: { value: 0 }, uColor: { value: hdr(PALETTE.violet, 1.6) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beltTop = new THREE.Mesh(new THREE.PlaneGeometry(BELT_END - BELT_START + 0.6, 1.5), beltMat);
  beltTop.rotation.x = -Math.PI / 2;
  beltTop.position.y = 1.01;
  belt.add(beltTop);

  // The AI scanning arch.
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.07, 10, 64, Math.PI), kit.glow(PALETTE.violet, 2.8));
  arch.position.set(0, 1, 0);
  belt.add(arch);
  const scanMat = kit.glow(PALETTE.violet, 1.2, { opacity: 0.25, additive: true, side: THREE.DoubleSide });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 2.6), scanMat);
  scan.position.set(0, 1.9, 0);
  scan.rotation.y = Math.PI / 2;
  scan.scale.set(1, 1, 1);
  belt.add(scan);
  const scanSheet = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), kit.glow(PALETTE.violet, 1, { opacity: 0.12, additive: true, side: THREE.DoubleSide }));
  scanSheet.position.set(0, 1.7, 0);
  scanSheet.rotation.y = Math.PI / 2;
  belt.add(scanSheet);

  // Documents in, reports out.
  const ITEMS = 9;
  const items = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.05, 0.82), kit.own(new THREE.MeshBasicMaterial({ color: 0xffffff })), ITEMS);
  belt.add(items);
  const paper = hdr(0xd9def5, 0.9);
  const report = hdr(PALETTE.mint, 2.2);
  const color = new THREE.Color();
  for (let i = 0; i < ITEMS; i++) items.setColorAt(i, paper);
  const checks = Array.from({ length: 5 }, () => {
    const s = checkSprite(kit, 0.62);
    s.visible = false;
    belt.add(s);
    return { sprite: s, age: 99 };
  });
  let nextCheck = 0;
  const lastX = new Array(ITEMS).fill(BELT_START);
  const warning = warningSprite(kit, 0.62);
  belt.add(warning);

  // Live report dashboard.
  const dash = new THREE.Group();
  dash.position.set(4.9, 2.6, -2.2);
  dash.rotation.y = -0.45;
  stage.add(dash);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.9), kit.glow(PALETTE.violetDeep, 0.6, { opacity: 0.35, additive: true, side: THREE.DoubleSide }));
  dash.add(panel);
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(3, 1.9)),
    kit.own(new THREE.LineBasicMaterial({ color: hdr(PALETTE.violet, 2.4) })),
  );
  dash.add(frame);
  const BARS = 7;
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 1, 0.04), kit.glow(PALETTE.mint, 2.6), BARS);
  dash.add(bars);
  const dashLabel = kit.label("AUTO REPORT", PALETTE.mint, 0.22);
  dashLabel.position.set(-0.75, 0.7, 0.02);
  dash.add(dashLabel);

  const robots = [-3.4, 3.4].map((x, i) => {
    const robot = new Robot(kit, { detail: "low", eye: PALETTE.violet, seed: 40 + i, antenna: true });
    robot.root.position.set(x, 0, -1.1);
    stage.add(robot.root);
    robot.setWorkAnchors(new THREE.Vector3(0.2, 1.22, 0.55), new THREE.Vector3(-0.2, 1.22, 0.55));
    const console = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.32), kit.glow(PALETTE.cyan, 1, { opacity: 0.22, additive: true, side: THREE.DoubleSide }));
    console.position.set(x, 1.45, -0.45);
    console.rotation.x = -0.5;
    stage.add(console);
    return robot;
  });

  return {
    hold: new THREE.Vector3(2.5, 6.4, 10.5),
    focus: new THREE.Vector3(0, 1.2, -0.3),
    update(dt, t, intro) {
      const run = smoothstep(0, 0.5, intro) * (reducedMotion ? 0.2 : 1);
      beltMat.uniforms.uSpeed.value = 0.9 * run;
      const span = BELT_END - BELT_START;
      for (let i = 0; i < ITEMS; i++) {
        const x = BELT_START + (((t * 0.9 * run + (i / ITEMS) * span) % span) + span) % span;
        tmpObject.position.set(x, 1.08, 0);
        tmpObject.rotation.set(0, 0, 0);
        tmpObject.scale.setScalar(clamp(intro * 2));
        tmpObject.updateMatrix();
        items.setMatrixAt(i, tmpObject.matrix);
        items.setColorAt(i, color.copy(paper).lerp(report, smoothstep(-0.3, 0.6, x)));
        // Each document crossing the arch earns an approval check.
        if (lastX[i] < 0.6 && x >= 0.6 && intro > 0.3) {
          const c = checks[nextCheck++ % checks.length];
          c.sprite.position.set(x, 1.5, 0);
          c.age = 0;
        }
        lastX[i] = x;
      }
      items.instanceMatrix.needsUpdate = true;
      if (items.instanceColor) items.instanceColor.needsUpdate = true;

      for (const c of checks) {
        c.age += dt;
        c.sprite.visible = c.age < 1.4;
        c.sprite.position.y = 1.5 + c.age * 0.6;
        c.sprite.material.opacity = 1 - smoothstep(0.7, 1.4, c.age);
      }

      // A risk is flagged before the arch, then resolved after it.
      const risky = (t * 0.9 * run) % span;
      const rx = BELT_START + risky;
      warning.position.set(rx, 1.75, 0);
      warning.visible = intro > 0.3 && rx < -0.2;
      warning.material.opacity = 0.6 + 0.4 * Math.sin(t * 8);

      scan.position.z = Math.sin(t * 3) * 0.6;
      scanMat.opacity = 0.15 + 0.2 * run;
      for (let b = 0; b < BARS; b++) {
        const h = 0.2 + (0.5 + 0.5 * Math.sin(t * 1.3 + b * 0.9)) * 1.1 * smoothstep(0.2, 0.8, intro);
        tmpObject.position.set(-1.1 + b * 0.36, -0.75 + h / 2, 0.02);
        tmpObject.scale.set(1, h, 1);
        tmpObject.updateMatrix();
        bars.setMatrixAt(b, tmpObject.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;

      robots.forEach((robot) => {
        robot.setMood(intro > 0.5 ? "focus" : "tired");
        robot.update(dt, t);
      });
    },
  };
};
