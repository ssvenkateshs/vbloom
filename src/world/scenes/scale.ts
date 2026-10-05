import * as THREE from "three";
import { PALETTE, arcBetween, clamp, easeOutBack, hdr, rng, smoothstep } from "../kit";
import { buildDrone, tmpObject } from "./shared";
import type { SceneBuilder } from "./types";

const CITY_VERT = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying float vSeed;
  void main() {
    vec4 local = instanceMatrix * vec4(position, 1.0);
    vLocal = local.xyz;
    vNormal = normalize(mat3(instanceMatrix) * normal);
    vSeed = float(gl_InstanceID);
    gl_Position = projectionMatrix * modelViewMatrix * local;
  }
`;

/** Dark glass towers with procedurally lit windows (no textures, no stretching). */
const CITY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uLit;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying float vSeed;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 n = normalize(vNormal);
    vec3 base = vec3(0.016, 0.018, 0.04) + vec3(0.02, 0.018, 0.05) * max(n.y, 0.0);
    float side = 1.0 - step(0.5, abs(n.y));
    float along = abs(n.x) > 0.5 ? vLocal.z : vLocal.x;
    vec2 cell = vec2(floor(along * 2.4), floor(vLocal.y * 3.0));
    float window = step(0.35, fract(along * 2.4)) * step(0.45, fract(vLocal.y * 3.0));
    float on = step(0.62, hash(cell + vSeed * 7.13));
    float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + hash(cell) * 30.0);
    vec3 tint = mix(vec3(0.55, 0.48, 1.0), vec3(0.3, 0.85, 1.0), hash(vec2(vSeed, 2.0)));
    vec3 col = base + tint * window * on * side * twinkle * 0.95 * uLit;
    col += vec3(0.55, 0.48, 1.0) * smoothstep(0.92, 1.0, n.y) * 0.08;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * 05 Scale: "The future is already here".
 * A neon city rises: construction, manufacturing, healthcare and finance landmarks,
 * drones flying between them and a digital twin scanning above.
 */
export const buildScale: SceneBuilder = ({ kit, island, reducedMotion }) => {
  const stage = island.stage;
  const random = rng(505);
  const landmarks = [
    new THREE.Vector3(-3.6, 0, 2.2), // construction
    new THREE.Vector3(3.4, 0, 2.4), // manufacturing
    new THREE.Vector3(-3.2, 0, -3.4), // healthcare
    new THREE.Vector3(3.6, 0, -2.8), // finance
  ];

  // Background towers on a loose grid, kept clear of the landmarks.
  const towers: { x: number; z: number; w: number; d: number; h: number; delay: number }[] = [];
  for (let gx = -7; gx <= 7; gx += 1.6) {
    for (let gz = -7; gz <= 7; gz += 1.6) {
      const x = gx + (random() - 0.5) * 0.5;
      const z = gz + (random() - 0.5) * 0.5;
      const r = Math.hypot(x, z);
      if (r > 7.6 || r < 1.6) continue;
      if (landmarks.some((l) => Math.hypot(l.x - x, l.z - z) < 1.9)) continue;
      towers.push({
        x,
        z,
        w: 0.6 + random() * 0.6,
        d: 0.6 + random() * 0.6,
        h: 0.6 + random() * random() * 4.2,
        delay: r / 7.6,
      });
    }
  }
  const cityMat = new THREE.ShaderMaterial({
    vertexShader: CITY_VERT,
    fragmentShader: CITY_FRAG,
    uniforms: { uTime: kit.time, uLit: { value: 0 } },
  });
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, towers.length);
  stage.add(city);

  // Construction: a wireframe tower topping out, and a crane.
  const site = new THREE.Group();
  site.position.copy(landmarks[0]);
  stage.add(site);
  const floors = Array.from({ length: 7 }, (_, i) => {
    const floor = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.4, 0.5, 1.4)),
      kit.own(new THREE.LineBasicMaterial({ color: hdr(PALETTE.amber, 2.2), transparent: true })),
    );
    floor.position.y = 0.25 + i * 0.5;
    site.add(floor);
    return floor;
  });
  const crane = new THREE.Group();
  crane.position.set(1.1, 0, -0.6);
  site.add(crane);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 5, 0.12), kit.structure());
  mast.position.y = 2.5;
  crane.add(mast);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.1), kit.glow(PALETTE.amber, 1.6));
  jib.position.set(-0.9, 5, 0);
  crane.add(jib);

  // Manufacturing: a factory with a turning gear and venting particles.
  const factory = new THREE.Group();
  factory.position.copy(landmarks[1]);
  stage.add(factory);
  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.6), kit.structure());
  hall.position.y = 0.6;
  factory.add(hall);
  const gear = new THREE.Group();
  gear.position.set(0, 1.0, 0.82);
  factory.add(gear);
  gear.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 8, 24), kit.glow(PALETTE.cyan, 2.4)));
  for (let k = 0; k < 10; k++) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), kit.glow(PALETTE.cyan, 2.4));
    const a = (k / 10) * Math.PI * 2;
    tooth.position.set(Math.cos(a) * 0.56, Math.sin(a) * 0.56, 0);
    tooth.rotation.z = a;
    gear.add(tooth);
  }
  const chimneys = [-0.7, -0.25].map((x) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.3, 12), kit.structure());
    c.position.set(x, 1.6, -0.4);
    factory.add(c);
    return new THREE.Vector3(x, 2.3, -0.4);
  });
  const STEAM = 60;
  const steam = kit.particles(STEAM);
  for (let i = 0; i < STEAM; i++) {
    const c = new THREE.Color(PALETTE.plasma).multiplyScalar(1.4);
    steam.colors.set([c.r, c.g, c.b], i * 3);
    steam.sizes[i] = 0.25 + random() * 0.25;
  }
  factory.add(steam);

  // Healthcare: a tower with a pulsing cross.
  const clinic = new THREE.Group();
  clinic.position.copy(landmarks[2]);
  stage.add(clinic);
  const clinicBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 1.4), kit.structure());
  clinicBody.position.y = 1.2;
  clinic.add(clinicBody);
  const crossMat = kit.own(new THREE.MeshBasicMaterial({ color: hdr(PALETTE.mint, 3) }));
  const cross = new THREE.Group();
  cross.position.set(0, 3.1, 0);
  cross.add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), crossMat));
  cross.add(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.22), crossMat));
  clinic.add(cross);

  // Finance: towers with a live chart above them.
  const bank = new THREE.Group();
  bank.position.copy(landmarks[3]);
  stage.add(bank);
  for (const [x, h] of [
    [-0.5, 3.4],
    [0.45, 2.6],
  ]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.75, h, 0.75), kit.structure());
    t.position.set(x, h / 2, 0);
    bank.add(t);
  }
  const BARS = 6;
  const bars = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.16, 1, 0.16),
    kit.glow(PALETTE.plasma, 2.4),
    BARS,
  );
  bars.position.set(0, 3.9, 0);
  bank.add(bars);
  const trendPoints = Array.from(
    { length: 12 },
    (_, i) => new THREE.Vector3(-0.9 + i * 0.16, 4.3 + Math.sin(i * 0.8) * 0.12 + i * 0.05, 0.2),
  );
  const trend = kit.tube(new THREE.CatmullRomCurve3(trendPoints), {
    color: PALETTE.mint,
    radius: 0.02,
    progress: 0,
  });
  bank.add(trend);

  // Digital twin hovering over the city centre.
  const twin = new THREE.Group();
  twin.position.set(0, 5.4, -0.4);
  stage.add(twin);
  const twinMat = kit.own(new THREE.LineBasicMaterial({ color: hdr(PALETTE.cyan, 2), transparent: true }));
  for (const [w, h, d, y] of [
    [1.6, 0.9, 1.6, 0],
    [1.1, 1.2, 1.1, 1.05],
    [0.6, 0.8, 0.6, 2.05],
  ]) {
    const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), twinMat);
    box.position.y = y;
    twin.add(box);
  }
  const twinScan = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.4),
    kit.glow(PALETTE.cyan, 1, { opacity: 0.18, additive: true, side: THREE.DoubleSide }),
  );
  twinScan.rotation.x = -Math.PI / 2;
  twin.add(twinScan);
  const twinBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.9, 4, 16, 1, true),
    kit.glow(PALETTE.cyan, 1, { opacity: 0.12, additive: true }),
  );
  twinBeam.position.y = -2.4;
  twin.add(twinBeam);

  // Data arcs between the industries.
  const arcs = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
  ].map(([a, b], i) => {
    const from = landmarks[a].clone().setY(2.6);
    const to = landmarks[b].clone().setY(2.6);
    const tube = kit.tube(arcBetween(from, to, 2.2), {
      color: i % 2 ? PALETTE.violet : PALETTE.cyan,
      radius: 0.025,
      dash: 8,
      speed: 0.7,
      progress: 0,
    });
    stage.add(tube);
    return tube;
  });

  const drones = Array.from({ length: kit.lowPower ? 3 : 5 }, (_, i) => {
    const d = buildDrone(kit, i % 2 ? PALETTE.violet : PALETTE.cyan);
    d.drone.scale.setScalar(0.9);
    stage.add(d.drone);
    return { ...d, radius: 3.2 + i * 0.9, height: 3 + (i % 3) * 0.8, speed: 0.35 + i * 0.07, phase: i * 1.7 };
  });

  return {
    hold: new THREE.Vector3(-5, 7, 15),
    focus: new THREE.Vector3(0, 2.2, -0.4),
    update(dt, t, intro) {
      const motion = reducedMotion ? 0.2 : 1;
      towers.forEach((tower, i) => {
        const rise = easeOutBack(clamp((intro * 1.8 - tower.delay * 0.8) / 0.6));
        const h = Math.max(0.001, tower.h * rise);
        tmpObject.position.set(tower.x, h / 2, tower.z);
        tmpObject.rotation.set(0, 0, 0);
        tmpObject.scale.set(tower.w, h, tower.d);
        tmpObject.updateMatrix();
        city.setMatrixAt(i, tmpObject.matrix);
      });
      city.instanceMatrix.needsUpdate = true;
      cityMat.uniforms.uLit.value = smoothstep(0.3, 0.9, intro);

      floors.forEach((floor, i) => {
        const shown = clamp(intro * 8 - i * 0.6);
        floor.visible = shown > 0.02;
        (floor.material as THREE.LineBasicMaterial).opacity = shown;
      });
      crane.rotation.y = Math.sin(t * 0.35) * 0.6 * motion;
      gear.rotation.z = -t * 1.2 * motion;
      for (let i = 0; i < STEAM; i++) {
        const age = (t * 0.35 * motion + i / STEAM) % 1;
        const src = chimneys[i % chimneys.length];
        steam.positions.set(
          [src.x + Math.sin(i * 3.1 + t) * 0.15 * age, src.y + age * 2.2, src.z + age * 0.4],
          i * 3,
        );
        steam.alphas[i] = (1 - age) * 0.6 * smoothstep(0.3, 0.7, intro);
      }
      steam.commit();
      crossMat.color.copy(
        hdr(PALETTE.mint, 1.5 + 2 * Math.abs(Math.sin(t * 1.6)) * smoothstep(0.3, 0.8, intro)),
      );
      for (let b = 0; b < BARS; b++) {
        const h = 0.2 + (0.5 + 0.5 * Math.sin(t * 1.1 + b)) * 0.7 * smoothstep(0.3, 0.8, intro);
        tmpObject.position.set(-0.8 + b * 0.32, h / 2, 0);
        tmpObject.scale.set(1, h, 1);
        tmpObject.updateMatrix();
        bars.setMatrixAt(b, tmpObject.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
      trend.setProgress(smoothstep(0.5, 0.95, intro));
      arcs.forEach((arc, i) => arc.setProgress(clamp((intro - 0.45 - i * 0.08) / 0.3)));

      twin.rotation.y = t * 0.25 * motion;
      twin.visible = intro > 0.4;
      twinMat.opacity = smoothstep(0.4, 0.8, intro);
      twinScan.position.y = -0.4 + ((t * 0.5) % 1) * 2.8;

      drones.forEach((d) => {
        const a = d.phase + t * d.speed * motion;
        d.drone.position.set(
          Math.cos(a) * d.radius,
          d.height + Math.sin(t * 1.3 + d.phase) * 0.3,
          Math.sin(a) * d.radius * 0.8,
        );
        d.drone.rotation.y = -a;
        d.drone.visible = intro > 0.35;
        d.spin(t);
      });
    },
  };
};
