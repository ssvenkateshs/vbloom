import * as THREE from "three";
import { Kit, PALETTE, clamp, smoothstep } from "./kit";
import { Robot } from "./robot";
import { buildBackdropGrid } from "./space";
import { buildWordmark } from "./wordmark";

export type HeroInput = {
  dt: number;
  t: number;
  camera: THREE.PerspectiveCamera;
  /** Pointer in NDC, or null when idle. */
  pointer: THREE.Vector2 | null;
  /** 0 at rest, rising to 1 as the visitor scrolls away from Earth. */
  departure: number;
  reducedMotion: boolean;
};

const _ray = new THREE.Raycaster();
const _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.95);
const _hit = new THREE.Vector3();
const _head = new THREE.Vector3();
const _reach = new THREE.Vector3();

/**
 * The opening shot: a NEOBOT-style robot in low Earth orbit, a neon wordmark behind
 * it, a SYNRAX-style halo and dashed orbit ring. It tracks the visitor's cursor.
 */
export function buildHero(kit: Kit) {
  const group = new THREE.Group();
  const robot = new Robot(kit, { detail: "high", eye: PALETTE.violet, accent: PALETTE.violet, seed: 3 });
  robot.root.rotation.y = -0.12;
  group.add(robot.root);

  // Floating platform under its feet, revealed as the camera rises.
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.08, 0.12, 64), kit.structure());
  platform.position.y = -0.06;
  group.add(platform);
  const platformRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.014, 8, 96), kit.glow(PALETTE.violet, 3));
  platformRing.rotation.x = Math.PI / 2;
  platformRing.position.y = 0.005;
  group.add(platformRing);
  const underGlow = kit.halo(PALETTE.violet, 3.4, 0.35);
  underGlow.position.y = -0.25;
  group.add(underGlow);

  // Backlight halo: a bright core behind the head, the SYNRAX silhouette trick.
  const haloCore = kit.halo(0xe8e4ff, 2.3, 0.3);
  haloCore.position.set(0, 2.08, -0.9);
  group.add(haloCore);
  const haloWide = kit.halo(PALETTE.violetDeep, 7.5, 0.09);
  haloWide.position.set(0, 1.7, -1.6);
  group.add(haloWide);

  const dashed = (radius: number, dash: number, gap: number, opacity: number) => {
    const points = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2).getPoints(160);
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      kit.own(
        new THREE.LineDashedMaterial({
          color: 0xffffff,
          dashSize: dash,
          gapSize: gap,
          transparent: true,
          opacity,
          depthWrite: false,
        }),
      ),
    );
    line.computeLineDistances();
    return line;
  };
  const orbitInner = dashed(1.02, 0.07, 0.06, 0.38);
  orbitInner.position.set(0, 2.02, -0.45);
  group.add(orbitInner);
  const orbitOuter = dashed(1.62, 0.025, 0.09, 0.22);
  orbitOuter.position.set(0, 1.9, -0.7);
  group.add(orbitOuter);

  const wordmark = buildWordmark(kit, "VBLOOM", 5.8, 0xffffff, 1.12);
  wordmark.position.set(0, 1.86, -2.7);
  group.add(wordmark);

  const grid = buildBackdropGrid(34, 18, new THREE.Vector2(0, 1.6));
  grid.position.set(0, 1.6, -8);
  group.add(grid);

  // Rim lights: violet from the left, cyan from the right, a cool spot from behind.
  const rimLeft = new THREE.PointLight(PALETTE.violet, 14, 10, 2);
  rimLeft.position.set(-2.1, 2.6, -1.3);
  const rimRight = new THREE.PointLight(PALETTE.cyan, 9, 10, 2);
  rimRight.position.set(2.3, 2.2, -1.1);
  const back = new THREE.SpotLight(0xdcd8ff, 30, 12, 0.7, 1, 2);
  back.position.set(0, 4.6, -2.4);
  back.target = robot.head;
  const fill = new THREE.PointLight(0xb8b0ff, 2, 8, 2);
  fill.position.set(-1.2, 1.8, 2.6);
  group.add(rimLeft, rimRight, back, fill);

  let lastPointer = -10;
  let greetedForDeparture = false;

  const update = ({ dt, t, camera, pointer, departure, reducedMotion }: HeroInput) => {
    orbitInner.rotation.z = reducedMotion ? 0 : t * 0.08;
    orbitOuter.rotation.z = reducedMotion ? 0 : -t * 0.05;
    haloCore.material.opacity = 0.3 + Math.sin(t * 1.3) * 0.03;

    if (departure > 0.02) {
      // Leaving: it watches the camera rise and waves goodbye once.
      robot.lookAt(camera.position);
      robot.reach(0, null, 0);
      robot.reach(1, null, 0);
      if (!greetedForDeparture && departure > 0.08) {
        robot.greet(2.6);
        greetedForDeparture = true;
      }
    } else {
      greetedForDeparture = false;
      if (pointer) {
        lastPointer = t;
        _ray.setFromCamera(pointer, camera);
        if (_ray.ray.intersectPlane(_plane, _hit)) {
          robot.lookAt(_hit);
          robot.headWorldPosition(_head);
          const headNdc = _head.clone().project(camera);
          const dx = pointer.x - headNdc.x;
          const dy = pointer.y - headNdc.y;
          const aspect = camera.aspect;
          // Hovering near its face makes it wave.
          if (Math.hypot(dx * aspect, dy) < 0.16 && !robot.isGreeting) robot.greet();
          // The arm on the cursor's side reaches toward it; the other relaxes.
          _reach.set(clamp(_hit.x, -1.25, 1.25), clamp(_hit.y, 0.85, 2.25), 0.62);
          const lift = 0.6 + 0.4 * smoothstep(-0.9, 0.0, dy);
          const right = smoothstep(-0.02, 0.26, dx) * 0.95 * lift;
          const left = smoothstep(-0.02, 0.26, -dx) * 0.95 * lift;
          robot.reach(Robot.LEFT, _reach, right);
          robot.reach(Robot.RIGHT, _reach, left);
        }
      } else if (t - lastPointer > 3.5) {
        robot.lookAt(null);
        robot.reach(0, null, 0);
        robot.reach(1, null, 0);
      }
    }
    robot.update(dt, t);
  };

  const greet = () => robot.greet();

  /** Screen-space test: is this NDC point over the robot's upper body? */
  const hitsRobot = (ndc: THREE.Vector2, camera: THREE.PerspectiveCamera) => {
    robot.headWorldPosition(_head);
    const head = _head.clone().project(camera);
    const chest = robot.spine.localToWorld(new THREE.Vector3(0, 0.35, 0)).project(camera);
    const dx = (ndc.x - head.x) * camera.aspect;
    const withinX = Math.abs(dx) < 0.22;
    return withinX && ndc.y < head.y + 0.12 && ndc.y > chest.y - 0.25;
  };

  return { group, robot, update, greet, hitsRobot };
}

export type Hero = ReturnType<typeof buildHero>;
