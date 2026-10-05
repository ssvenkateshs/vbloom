import * as THREE from "three";
import { Kit, PALETTE, clamp, rng } from "./kit";

const NOISE = /* glsl */ `
  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise3(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

const SPHERE_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vObjN;
  void main() {
    vObjN = normalize(position);
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vP = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/** Earth at night with a sunrise on the limb: the place the visitor is leaving. */
const EARTH_FRAG = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uCam;
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vObjN;
  ${NOISE}
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(uCam - vP);
    float day = smoothstep(-0.12, 0.45, dot(n, uSun));
    float land = smoothstep(0.5, 0.57, fbm(vObjN * 2.4));
    float cloud = smoothstep(0.56, 0.78, fbm(vObjN * 5.0 + 3.1));
    vec3 col = mix(vec3(0.004, 0.016, 0.05), vec3(0.018, 0.04, 0.035), land) * (0.12 + day * 1.5);
    col += vec3(0.55) * cloud * day * 0.45;
    float lights = land * (1.0 - day) * smoothstep(0.6, 0.86, fbm(vObjN * 46.0));
    col += vec3(1.0, 0.6, 0.28) * lights * 1.4;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
    float scatter = pow(max(dot(-v, uSun), 0.0), 5.0);
    col += vec3(0.18, 0.5, 1.0) * fres * (0.25 + 1.6 * scatter + day * 0.6);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vNView;
  varying vec3 vP;
  void main() {
    vNView = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vP = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSun;
  uniform vec3 uCam;
  uniform float uPower;
  varying vec3 vNView;
  varying vec3 vP;
  void main() {
    float rim = pow(clamp(0.62 - dot(vNView, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), uPower);
    vec3 v = normalize(uCam - vP);
    float scatter = pow(max(dot(-v, uSun), 0.0), 4.0);
    gl_FragColor = vec4(uColor * rim * (1.0 + 2.0 * scatter), rim);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** The destination: a banded violet gas giant. */
const PLANET_FRAG = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uCam;
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vP;
  varying vec3 vObjN;
  ${NOISE}
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(uCam - vP);
    float warp = fbm(vObjN * vec3(2.0, 7.0, 2.0) + vec3(uTime * 0.004, 0.0, 0.0));
    float bands = sin(vObjN.y * 17.0 + warp * 4.5);
    vec3 col = mix(vec3(0.09, 0.05, 0.3), vec3(0.42, 0.2, 0.78), smoothstep(-0.7, 0.9, bands));
    col = mix(col, vec3(0.06, 0.34, 0.4), smoothstep(0.62, 0.9, fbm(vObjN * 3.2 + 7.0)) * 0.55);
    col = mix(col, vec3(0.85, 0.5, 0.95), smoothstep(0.86, 0.98, bands) * 0.35);
    float ndl = max(dot(n, uSun), 0.0);
    col *= 0.05 + ndl * 1.15;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    col += vec3(0.55, 0.38, 1.0) * fres * 0.85;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const RING_VERT = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAG = /* glsl */ `
  uniform float uInner;
  uniform float uOuter;
  varying vec3 vLocal;
  ${NOISE}
  void main() {
    float r = length(vLocal.xy);
    float u = (r - uInner) / (uOuter - uInner);
    float bands = noise3(vec3(u * 60.0, 0.0, 0.0)) * 0.7 + noise3(vec3(u * 210.0, 1.0, 0.0)) * 0.3;
    float gap = smoothstep(0.42, 0.45, u) * (1.0 - smoothstep(0.5, 0.53, u));
    float alpha = bands * smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.86, 1.0, u)) * (1.0 - gap * 0.85);
    vec3 col = mix(vec3(0.55, 0.45, 1.0), vec3(0.9, 0.85, 1.0), bands) * 0.8;
    gl_FragColor = vec4(col, alpha * 0.55);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const GRID_VERT = /* glsl */ `
  varying vec2 vXY;
  void main() {
    vXY = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRID_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uCell;
  uniform vec2 uFocus;
  uniform float uRadius;
  uniform float uOpacity;
  varying vec2 vXY;
  void main() {
    vec2 p = vXY / uCell;
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float fade = 1.0 - smoothstep(0.0, uRadius, length(vXY - uFocus));
    gl_FragColor = vec4(uColor * line * fade * uOpacity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const WARP_VERT = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const WARP_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vT;
  void main() {
    gl_FragColor = vec4(uColor * vT, vT * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Faint vertical grid behind the hero, like the SYNRAX backdrop. */
export function buildBackdropGrid(width: number, height: number, focus: THREE.Vector2) {
  const material = new THREE.ShaderMaterial({
    vertexShader: GRID_VERT,
    fragmentShader: GRID_FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(0xb9b2ff) },
      uCell: { value: 1.1 },
      uFocus: { value: focus },
      uRadius: { value: 7.5 },
      uOpacity: { value: 0.07 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

export type Space = {
  group: THREE.Group;
  earth: THREE.Group;
  planet: THREE.Group;
  /** Build the launch streaks once the camera path exists. */
  attachWarp(curve: THREE.Curve<THREE.Vector3>, from: number, to: number): void;
  update(t: number, camera: THREE.Camera, warp: number, pathU: number): void;
};

export function buildSpace(kit: Kit): Space {
  const group = new THREE.Group();
  const random = rng(7);
  const center = new THREE.Vector3(0, 40, -230);

  // --- stars -----------------------------------------------------------------
  const starCount = kit.lowPower ? 2200 : 4800;
  const stars = kit.particles(starCount, { twinkle: 0.35 });
  const tints = [0xffffff, 0xdfe6ff, 0xc9d4ff, 0xd9c9ff, PALETTE.violet, PALETTE.cyan].map((c) => new THREE.Color(c));
  for (let i = 0; i < starCount; i++) {
    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const r = 650 + random() * 650;
    const s = Math.sqrt(1 - u * u);
    stars.positions.set([center.x + r * s * Math.cos(theta), center.y + r * u, center.z + r * s * Math.sin(theta)], i * 3);
    const tint = tints[random() < 0.82 ? Math.floor(random() * 4) : 4 + Math.floor(random() * 2)];
    const bright = 0.5 + random() * random() * 2.2;
    stars.colors.set([tint.r * bright, tint.g * bright, tint.b * bright], i * 3);
    stars.sizes[i] = 1.4 + random() * random() * 4.5;
  }
  stars.commit();
  group.add(stars);

  // --- nebulae -----------------------------------------------------------------
  const nebulae: [number, number, number, number, number, number][] = [
    [PALETTE.violetDeep, -520, 120, -1050, 1300, 0.05],
    [PALETTE.plasma, 380, 260, -980, 900, 0.035],
    [PALETTE.teal, -120, -260, -1100, 1100, 0.03],
    [0x3a2bff, 600, -40, -620, 800, 0.03],
    [PALETTE.violet, -700, 300, -200, 900, 0.02],
  ];
  for (const [color, x, y, z, scale, opacity] of nebulae) {
    const cloud = kit.halo(color, scale, opacity);
    cloud.position.set(x, y, z);
    group.add(cloud);
  }

  // --- Earth: below the hero, so the robot floats in low orbit ---------------------
  const sunrise = new THREE.Vector3(0.28, 0.12, -1).normalize();
  const earth = new THREE.Group();
  earth.position.set(0, -277, -262);
  const earthRadius = 220;
  const earthMat = new THREE.ShaderMaterial({
    vertexShader: SPHERE_VERT,
    fragmentShader: EARTH_FRAG,
    uniforms: { uSun: { value: sunrise }, uCam: { value: new THREE.Vector3() } },
  });
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(earthRadius, 96, 64), earthMat));
  const atmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMO_VERT,
    fragmentShader: ATMO_FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(0x3d8bff).multiplyScalar(0.8) },
      uSun: { value: sunrise },
      uCam: { value: new THREE.Vector3() },
      uPower: { value: 7 },
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(earthRadius * 1.035, 96, 64), atmoMat));
  group.add(earth);

  // --- the destination gas giant + rings ------------------------------------------
  const planet = new THREE.Group();
  planet.position.set(-330, -10, -760);
  const planetRadius = 200;
  const planetLight = new THREE.Vector3(0.55, 0.42, 0.72).normalize();
  const planetMat = new THREE.ShaderMaterial({
    vertexShader: SPHERE_VERT,
    fragmentShader: PLANET_FRAG,
    uniforms: { uSun: { value: planetLight }, uCam: { value: new THREE.Vector3() }, uTime: kit.time },
  });
  const planetBody = new THREE.Mesh(new THREE.SphereGeometry(planetRadius, 96, 64), planetMat);
  planetBody.rotation.z = 0.32;
  planet.add(planetBody);
  const planetAtmo = new THREE.ShaderMaterial({
    vertexShader: ATMO_VERT,
    fragmentShader: ATMO_FRAG,
    uniforms: {
      uColor: { value: new THREE.Color(PALETTE.violet).multiplyScalar(1.3) },
      uSun: { value: planetLight.clone().negate() },
      uCam: { value: new THREE.Vector3() },
      uPower: { value: 3.5 },
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(planetRadius * 1.05, 64, 48), planetAtmo));
  const inner = planetRadius * 1.28;
  const outer = planetRadius * 2.15;
  const ringMat = new THREE.ShaderMaterial({
    vertexShader: RING_VERT,
    fragmentShader: RING_FRAG,
    uniforms: { uInner: { value: inner }, uOuter: { value: outer } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 192, 1), ringMat);
  ring.rotation.set(-1.22, 0.18, 0.32);
  planet.add(ring);
  group.add(planet);

  // A small moon for depth.
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(18, 48, 32),
    new THREE.ShaderMaterial({
      vertexShader: SPHERE_VERT,
      fragmentShader: PLANET_FRAG.replace("vec3(0.09, 0.05, 0.3)", "vec3(0.05, 0.12, 0.16)"),
      uniforms: { uSun: { value: planetLight }, uCam: { value: new THREE.Vector3() }, uTime: kit.time },
    }),
  );
  moon.position.set(160, 150, -620);
  group.add(moon);

  // --- warp streaks (built once the camera path is known) ----------------------------
  let warp: THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial> | undefined;
  const attachWarp = (curve: THREE.Curve<THREE.Vector3>, from: number, to: number) => {
    const count = kit.lowPower ? 260 : 620;
    const positions = new Float32Array(count * 6);
    const ts = new Float32Array(count * 2);
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();
    const up = new THREE.Vector3();
    const p = new THREE.Vector3();
    const r = rng(42);
    for (let i = 0; i < count; i++) {
      const at = from + (to - from) * r();
      curve.getPoint(clamp(at), p);
      curve.getTangent(clamp(at), tangent).normalize();
      side.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      up.crossVectors(side, tangent).normalize();
      const angle = r() * Math.PI * 2;
      const radius = 2.5 + r() * 22;
      p.addScaledVector(side, Math.cos(angle) * radius).addScaledVector(up, Math.sin(angle) * radius);
      const len = 3 + r() * 14;
      positions.set([p.x, p.y, p.z, p.x + tangent.x * len, p.y + tangent.y * len, p.z + tangent.z * len], i * 6);
      ts.set([0, 1], i * 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aT", new THREE.BufferAttribute(ts, 1));
    warp = new THREE.LineSegments(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: WARP_VERT,
        fragmentShader: WARP_FRAG,
        uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0xcfe0ff).multiplyScalar(2.2) } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    warp.frustumCulled = false;
    warp.visible = false;
    group.add(warp);
  };

  const update = (t: number, camera: THREE.Camera, warpAmount: number, pathU: number) => {
    // The destination only appears once the visitor has left Earth behind.
    const departed = pathU > 1.55;
    planet.visible = departed;
    moon.visible = departed;
    const cam = camera.position;
    earthMat.uniforms.uCam.value.copy(cam);
    atmoMat.uniforms.uCam.value.copy(cam);
    planetMat.uniforms.uCam.value.copy(cam);
    planetAtmo.uniforms.uCam.value.copy(cam);
    (moon.material as THREE.ShaderMaterial).uniforms.uCam.value.copy(cam);
    planetBody.rotation.y = t * 0.004;
    if (warp) {
      warp.material.uniforms.uOpacity.value = warpAmount;
      warp.visible = warpAmount > 0.01;
    }
  };

  return { group, earth, planet, attachWarp, update };
}
