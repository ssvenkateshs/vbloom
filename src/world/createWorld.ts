import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { buildHero } from "./hero";
import { buildIsland, type Island } from "./island";
import { Kit, clamp, damp, lerp, smoothstep } from "./kit";
import { POINT, POINT_COUNT, SCENE_COUNT, activeScene, buildLayout, pathAt } from "./layout";
import { SCENE_BUILDERS, SCENE_RIMS, type SceneHandle } from "./scenes";
import { buildSpace } from "./space";

export type WorldOptions = {
  /** Resolved CSS font-family for 3D labels (the display face). */
  fontFamily: string;
  reducedMotion: boolean;
  /** Phones and low-end devices: fewer particles, lower pixel ratio. */
  lowPower: boolean;
};

export type World = {
  /** Scroll position within the experience, in viewport heights. */
  setScroll(scroll: number): void;
  /** Pointer in normalised device coordinates (−1 … 1). */
  setPointer(x: number, y: number): void;
  clearPointer(): void;
  /** Returns true when the press landed on the hero robot. */
  pointerDown(x: number, y: number): boolean;
  start(): void;
  stop(): void;
  dispose(): void;
  stats(): Record<string, number | string>;
  /** Debug only: pin the camera to a pose (null restores the scroll-driven path). */
  debugView(position: [number, number, number] | null, target?: [number, number, number], fov?: number): void;
  /** Debug only: world transform of a named object. */
  debugObject(name: string): { position: number[]; rotation: number[]; worldPosition: number[] } | null;
  /** Debug only: show or hide a named object (used to render clean stills). */
  debugSetVisible(name: string, visible: boolean): void;
};

/** Island centres: a winding route up and away, toward the ringed planet. */
const ISLANDS = [
  new THREE.Vector3(0, 58, -80),
  new THREE.Vector3(34, 64, -140),
  new THREE.Vector3(-6, 72, -205),
  new THREE.Vector3(-40, 68, -270),
  new THREE.Vector3(-6, 76, -335),
  new THREE.Vector3(30, 82, -400),
];

type Path = { pos: THREE.CatmullRomCurve3; target: THREE.CatmullRomCurve3; fov: number[] };

function buildPath(aspect: number, scenes: SceneHandle[]): Path {
  const narrow = aspect < 1;
  const f = narrow ? clamp(1.05 / aspect, 1, 1.7) : 1;
  const pos: THREE.Vector3[] = [];
  const target: THREE.Vector3[] = [];
  const fov: number[] = [];
  const add = (p: THREE.Vector3, t: THREE.Vector3, v: number) => {
    pos.push(p);
    target.push(t);
    fov.push(v + (narrow ? 9 : 0));
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Hero: robot right of centre on wide screens, centred and higher on phones.
  if (narrow) add(V(0, 1.15, Math.max(5, 2.9 / aspect)), V(0, 0.2, 0), 33);
  else add(V(-0.8, 1.5, 3.55), V(-0.8, 1.5, 0), 32);
  // Rise: look down on the robot as it waves goodbye.
  add(V(-1.7, 4.8, 6.4), V(0, 1.3, 0), 40);
  // Launch: turn toward the new world; warp streaks fill this stretch.
  add(V(0, 24, 6), ISLANDS[0].clone().add(V(0, 2, 0)), 66);

  scenes.forEach((scene, i) => {
    const c = ISLANDS[i];
    const next = ISLANDS[i + 1];
    const side = i % 2 === 0 ? 1 : -1;
    add(c.clone().add(V(side * 5 * f, 14, 30 * f)), c.clone().add(V(0, 1.5, 0)), 46);
    // Hold pose, slid sideways (or down on phones) so the scene composes beside the
    // copy panel rather than underneath it.
    const holdPos = c.clone().add(scene.hold.clone().multiply(V(f, 1, f)));
    const holdTarget = c.clone().add(scene.focus);
    const forward = holdTarget.clone().sub(holdPos);
    const distance = forward.length();
    forward.normalize();
    const rightDir = new THREE.Vector3().crossVectors(forward, V(0, 1, 0)).normalize();
    const upDir = new THREE.Vector3().crossVectors(rightDir, forward).normalize();
    const halfHeight = distance * Math.tan(THREE.MathUtils.degToRad((narrow ? 51 : 42) / 2));
    const offset = narrow
      ? upDir.multiplyScalar(-0.3 * halfHeight)
      : rightDir.multiplyScalar(-0.36 * halfHeight * aspect);
    add(holdPos.add(offset), holdTarget.add(offset), 42);
    if (next) {
      add(
        c.clone().add(V(-side * 5 * f, 9, 10 * f)),
        c
          .clone()
          .lerp(next, 0.4)
          .add(V(0, 4, 0)),
        48,
      );
      add(
        c
          .clone()
          .lerp(next, 0.5)
          .add(V(0, 22, 14)),
        next.clone().add(V(0, 2, 0)),
        52,
      );
    } else {
      // Finale pull-back: the bloomed island with the planet behind it.
      add(c.clone().add(V(-12 * f, 20, 34 * f)), c.clone().add(V(-5, 5, -14)), 50);
    }
  });

  if (pos.length !== POINT_COUNT)
    throw new Error(`camera path has ${pos.length} points, expected ${POINT_COUNT}`);
  return {
    pos: new THREE.CatmullRomCurve3(pos, false, "centripetal"),
    target: new THREE.CatmullRomCurve3(target, false, "centripetal"),
    fov,
  };
}

/**
 * A black studio with a few softbox strips. Glossy black surfaces reflect it as crisp
 * highlights on a dark body, the product-render look of the reference robots.
 */
function studioScene() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x010104);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const panel = (w: number, h: number, color: number, intensity: number, x: number, y: number, z: number) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(w, h, 1);
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(9, 3, 0xffffff, 3.2, 0, 9, 1.5);
  panel(1.4, 10, 0xc4bbff, 2.4, -8, 1.5, -2);
  panel(1.4, 10, 0xd6ecff, 2, 8, 1.2, -1.5);
  panel(7, 1.1, 0x8b7cff, 1.6, 0, -1.5, -8);
  panel(5, 2.5, 0xffffff, 0.45, 0, 2.5, 9);
  return env;
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

export async function createWorld(host: HTMLElement, options: WorldOptions): Promise<World> {
  if (!hasWebGL()) throw new Error("WebGL2 is not available");

  const { reducedMotion, lowPower } = options;
  try {
    await Promise.race([
      document.fonts.load(`600 64px ${options.fontFamily}`),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // Labels fall back to the next family in the stack.
  }

  const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, powerPreference: "high-performance" });
  const basePixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75);
  renderer.setPixelRatio(basePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.info.autoReset = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02030a);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = studioScene();
  const envTexture = pmrem.fromScene(studio, 0.02).texture;
  scene.environment = envTexture;
  studio.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose();
    (mesh.material as THREE.Material | undefined)?.dispose();
  });
  pmrem.dispose();

  const sun = new THREE.DirectionalLight(0xdcd6ff, 1.7);
  sun.position.set(0.6, 1, 0.55);
  scene.add(sun, new THREE.HemisphereLight(0x8b7cff, 0x05060f, 0.45));

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 4000);
  const kit = new Kit(options.fontFamily, lowPower);
  const layout = buildLayout();

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.75, 0.5, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  let bloomEnabled = true;

  // --- content -------------------------------------------------------------------
  const space = buildSpace(kit);
  scene.add(space.group);
  const hero = buildHero(kit);
  scene.add(hero.group);

  const islands: Island[] = [];
  const scenes: SceneHandle[] = [];
  for (let i = 0; i < SCENE_COUNT; i++) {
    const island = buildIsland(kit, { rim: SCENE_RIMS[i], seed: 11 + i * 7 });
    island.group.position.copy(ISLANDS[i]);
    island.group.rotation.y = i % 2 === 0 ? -0.18 : 0.18;
    scene.add(island.group);
    islands.push(island);
    scenes.push(SCENE_BUILDERS[i]({ kit, island, reducedMotion }));
  }

  // --- camera path -------------------------------------------------------------------
  let path: Path | null = null;
  let pathWidth = 0;
  let warpAttached = false;
  const fovAt = (u: number) => {
    const fov = path!.fov;
    const i = Math.floor(clamp(u, 0, fov.length - 1));
    const j = Math.min(i + 1, fov.length - 1);
    return lerp(fov[i], fov[j], smoothstep(0, 1, u - i));
  };

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Rebuild the route only when the width changes: a phone URL bar collapsing
    // must not jolt the camera.
    if (width !== pathWidth) {
      pathWidth = width;
      path = buildPath(camera.aspect, scenes);
      if (!warpAttached) {
        space.attachWarp(path.pos, POINT.rise / (POINT_COUNT - 1), POINT.establish(0) / (POINT_COUNT - 1));
        warpAttached = true;
      }
    }
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(host);

  // --- state ---------------------------------------------------------------------------
  let scroll = 0;
  let currentU = 0;
  let initialised = false;
  const pointer = new THREE.Vector2();
  let pointerAt = -Infinity;
  let pointerActive = false;
  const parallax = new THREE.Vector2();
  const intro = new Array(SCENE_COUNT).fill(0);
  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const timer = new THREE.Timer();
  let frame = 0;
  // Our own clock: rAF timestamps mark the frame start, so the first frame after a
  // resume can yield a negative delta. Accumulating clamped deltas keeps time monotonic.
  let elapsed = 0;
  let running = false;
  let raf = 0;
  const frameTimes: number[] = [];
  let quality = 2;
  let debugPose: { position: THREE.Vector3; target: THREE.Vector3; fov: number } | null = null;

  const targetU = () => {
    if (!reducedMotion) return pathAt(layout, scroll);
    // Reduced motion: cut between held shots instead of flying.
    const active = activeScene(layout, scroll);
    return active < 0 ? POINT.hero : POINT.hold(active);
  };

  const adaptQuality = (dt: number) => {
    if (frame < 40 || quality === 0) return;
    frameTimes.push(dt);
    if (frameTimes.length < 90) return;
    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    frameTimes.length = 0;
    if (avg > 0.028 && quality === 2) {
      quality = 1;
      renderer.setPixelRatio(Math.max(1, basePixelRatio * 0.7));
      composer.setPixelRatio(renderer.getPixelRatio());
      resize();
    } else if (avg > 0.034 && quality === 1) {
      quality = 0;
      bloomEnabled = false;
    }
  };

  const tick = (timestamp: number) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    timer.update(timestamp);
    const dt = clamp(timer.getDelta(), 0, 1 / 20);
    elapsed += dt;
    const t = elapsed;
    kit.time.value = t;
    frame++;
    renderer.info.reset();

    const goal = targetU();
    if (!initialised || reducedMotion) {
      currentU = goal;
      initialised = true;
    } else {
      currentU = damp(currentU, goal, 5.5, dt);
    }
    if (!path) return;

    const u = clamp(currentU, 0, POINT_COUNT - 1);
    const param = u / (POINT_COUNT - 1);
    path.pos.getPoint(param, camPos);
    path.target.getPoint(param, camTarget);

    // Subtle pointer parallax: barely in the hero (the robot reacts instead), more in flight.
    const idle = performance.now() - pointerAt > 4000;
    const strength = u < 0.6 ? 0.06 : 0.75;
    parallax.x = damp(parallax.x, pointerActive && !idle ? pointer.x * strength : 0, 3, dt);
    parallax.y = damp(parallax.y, pointerActive && !idle ? pointer.y * strength * 0.6 : 0, 3, dt);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);
    right.setFromMatrixColumn(camera.matrix, 0);
    up.setFromMatrixColumn(camera.matrix, 1);
    camera.position.addScaledVector(right, parallax.x).addScaledVector(up, parallax.y);
    camera.lookAt(camTarget);
    if (debugPose) {
      camera.position.copy(debugPose.position);
      camera.lookAt(debugPose.target);
    }
    const fov = debugPose ? debugPose.fov : fovAt(u);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    kit.pointScale.value =
      (renderer.domElement.height || host.clientHeight) /
      (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));

    // Hero robot.
    const heroVisible = u < POINT.establish(0) + 0.5;
    hero.group.visible = heroVisible;
    if (heroVisible) {
      hero.update({
        dt,
        t,
        camera,
        pointer: pointerActive && !idle && u < 0.35 ? pointer : null,
        departure: smoothstep(0.05, 1, u),
        reducedMotion,
      });
    }

    // Space + the launch streaks.
    const warp = reducedMotion ? 0 : smoothstep(1.15, 1.75, u) * (1 - smoothstep(2.35, 2.95, u));
    space.update(t, camera, warp, u);
    bloom.strength = 0.75 + warp * 0.35;

    // Scenes: autoplay their intro on arrival, reset once far away.
    for (let i = 0; i < SCENE_COUNT; i++) {
      const near = u >= POINT.establish(i) - 1.6 && u <= POINT.exit(i) + 2;
      const far = Math.abs(u - POINT.hold(i)) > 6;
      if (near) intro[i] = reducedMotion ? 1 : Math.min(1, intro[i] + dt / 3.4);
      else if (far) intro[i] = 0;
      const islandVisible = u > POINT.establish(i) - 8 && u < POINT.exit(i) + 5;
      islands[i].group.visible = islandVisible;
      const stageVisible = u > POINT.establish(i) - 4 && u < POINT.exit(i) + 4;
      islands[i].stage.visible = stageVisible;
      if (islandVisible) islands[i].update(t);
      if (stageVisible) scenes[i].update(dt, t, intro[i]);
    }

    if (bloomEnabled) composer.render(dt);
    else renderer.render(scene, camera);
    adaptQuality(dt);
  };

  const ndc = (x: number, y: number) => pointer.set(clamp(x, -1, 1), clamp(y, -1, 1));

  return {
    setScroll(value: number) {
      scroll = value;
    },
    setPointer(x: number, y: number) {
      ndc(x, y);
      pointerAt = performance.now();
      pointerActive = true;
    },
    clearPointer() {
      pointerActive = false;
    },
    pointerDown(x: number, y: number) {
      ndc(x, y);
      pointerAt = performance.now();
      pointerActive = true;
      if (!hero.group.visible) return false;
      const hit = hero.hitsRobot(pointer, camera);
      if (hit) hero.greet();
      return hit;
    },
    start() {
      if (running) return;
      running = true;
      timer.reset();
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      envTexture.dispose();
      kit.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
    debugView(position, target = [0, 1.6, 0], fov = 30) {
      debugPose = position
        ? { position: new THREE.Vector3(...position), target: new THREE.Vector3(...target), fov }
        : null;
    },
    debugSetVisible(name: string, visible: boolean) {
      const object = scene.getObjectByName(name);
      if (object) object.visible = visible;
    },
    debugObject(name: string) {
      const object = scene.getObjectByName(name);
      if (!object) return null;
      const world = object.getWorldPosition(new THREE.Vector3());
      const round = (n: number) => Number(n.toFixed(3));
      return {
        position: object.position.toArray().map(round),
        rotation: [object.rotation.x, object.rotation.y, object.rotation.z].map(round),
        worldPosition: world.toArray().map(round),
      };
    },
    stats() {
      const info = renderer.info;
      return {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        quality,
        u: Number(currentU.toFixed(3)),
        pixelRatio: renderer.getPixelRatio(),
      };
    },
  };
}
