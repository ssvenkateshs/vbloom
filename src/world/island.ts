import * as THREE from "three";
import { Kit, PALETTE, hdr, rng } from "./kit";

const TOP_VERT = /* glsl */ `
  varying vec2 vXY;
  void main() {
    vXY = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TOP_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uRadius;
  uniform float uTime;
  uniform float uPulse;
  varying vec2 vXY;
  void main() {
    vec2 p = vXY / 1.15;
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float r = length(vXY) / uRadius;
    float fade = 1.0 - smoothstep(0.45, 0.98, r);
    // Rings of light rippling outward from the centre.
    float wave = fract(r * 2.5 - uTime * 0.18);
    float ripple = smoothstep(0.0, 0.04, wave) * (1.0 - smoothstep(0.04, 0.16, wave)) * (1.0 - r);
    vec3 col = uColor * (line * 0.32 * fade + ripple * 0.5 * uPulse + smoothstep(0.9, 1.0, r) * 0.35);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export type Island = {
  group: THREE.Group;
  /** Content root: place scene objects here; y = 0 is the platform surface. */
  stage: THREE.Group;
  setRim(hex: number): void;
  update(t: number): void;
};

/** A floating neon platform with a faceted rock underside and drifting debris. */
export function buildIsland(kit: Kit, opts: { radius?: number; rim?: number; seed?: number } = {}): Island {
  const radius = opts.radius ?? 9;
  const rim = opts.rim ?? PALETTE.violet;
  const random = rng(opts.seed ?? 11);
  const group = new THREE.Group();
  const stage = new THREE.Group();
  group.add(stage);

  const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.97, 0.5, 72), kit.structure());
  top.position.y = -0.25;
  group.add(top);

  const gridMat = new THREE.ShaderMaterial({
    vertexShader: TOP_VERT,
    fragmentShader: TOP_FRAG,
    uniforms: {
      uColor: { value: hdr(rim, 1.05) },
      uRadius: { value: radius },
      uTime: kit.time,
      uPulse: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const grid = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.995, 72), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.006;
  group.add(grid);

  const rimMat = new THREE.MeshBasicMaterial({ color: hdr(rim, 2.3) });
  kit.own(rimMat);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.04, 8, 160), rimMat);
  rimRing.rotation.x = Math.PI / 2;
  group.add(rimRing);
  const outerMat = new THREE.MeshBasicMaterial({ color: hdr(rim, 1.4), transparent: true, opacity: 0.7 });
  kit.own(outerMat);
  const outer = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.14, 0.018, 6, 160), outerMat);
  outer.rotation.x = Math.PI / 2;
  outer.position.y = -0.35;
  group.add(outer);

  // Faceted underside: an inverted cone with jittered vertices.
  const coneGeo = new THREE.ConeGeometry(radius * 0.96, radius * 1.25, 14, 5, true);
  const pos = coneGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > radius * 0.6) continue; // keep the rim attached to the platform
    const j = 0.5 + random() * 0.9;
    pos.setXYZ(i, pos.getX(i) * j, y + (random() - 0.5) * 0.8, pos.getZ(i) * j);
  }
  coneGeo.computeVertexNormals();
  const underside = new THREE.Mesh(coneGeo, kit.rock());
  underside.rotation.x = Math.PI;
  underside.position.y = -0.5 - (radius * 1.25) / 2;
  group.add(underside);

  // Glowing crystal veins on the underside.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + random();
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35 + random() * 0.45), kit.glow(rim, 2.2));
    crystal.position.set(Math.cos(a) * radius * 0.55, -1.6 - random() * 3.5, Math.sin(a) * radius * 0.55);
    crystal.scale.y = 1.8;
    group.add(crystal);
  }

  const debris: { mesh: THREE.Mesh; base: THREE.Vector3; speed: number; phase: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + random() * 0.8, 0), kit.rock());
    const a = random() * Math.PI * 2;
    const r = radius * (1.15 + random() * 0.6);
    const base = new THREE.Vector3(Math.cos(a) * r, -1.5 - random() * 6, Math.sin(a) * r);
    rock.position.copy(base);
    group.add(rock);
    debris.push({ mesh: rock, base, speed: 0.3 + random() * 0.6, phase: random() * 10 });
  }

  const underGlow = kit.halo(rim, radius * 3.2, 0.22);
  underGlow.position.y = -3;
  group.add(underGlow);

  return {
    group,
    stage,
    setRim(hex: number) {
      rimMat.color.copy(hdr(hex, 2.3));
      outerMat.color.copy(hdr(hex, 1.4));
      gridMat.uniforms.uColor.value.copy(hdr(hex, 1.05));
      underGlow.material.color.set(hex);
    },
    update(t: number) {
      for (const d of debris) {
        d.mesh.position.y = d.base.y + Math.sin(t * d.speed + d.phase) * 0.35;
        d.mesh.rotation.x = t * d.speed * 0.3;
        d.mesh.rotation.y = t * d.speed * 0.2;
      }
    },
  };
}
