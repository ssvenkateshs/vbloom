import * as THREE from "three";

/** Neon palette for the 3D world. Hex values are sRGB; HDR intensity is applied per use. */
export const PALETTE = {
  violet: 0x8b7cff,
  violetDeep: 0x6d5efc,
  plasma: 0xc06bff,
  teal: 0x33bf92,
  mint: 0x65d6b0,
  cyan: 0x4cc9ff,
  red: 0xff4d6d,
  amber: 0xffb547,
  white: 0xffffff,
} as const;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Frame-rate independent exponential smoothing. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t: number) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/** Deterministic PRNG so the world looks identical on every load. */
export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const hdr = (hex: number, intensity: number) => new THREE.Color(hex).multiplyScalar(intensity);

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;
  uniform float uScale;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 1.0 - uTwinkle + uTwinkle * (0.55 + 0.45 * sin(uTime * 2.3 + position.x * 12.7 + position.y * 7.1));
    gl_PointSize = aSize * uScale / max(-mv.z, 0.001);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = aAlpha * uOpacity * tw;
  }
`;

const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    if (a * vAlpha < 0.003) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const TUBE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Light that "draws" along a tube: everything past uProgress is discarded, a bright
 * head leads the stroke, and optional dashes flow along it once drawn.
 */
const TUBE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorEnd;
  uniform float uProgress;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uDash;
  uniform float uSpeed;
  uniform float uHead;
  varying vec2 vUv;
  void main() {
    float t = vUv.x;
    if (t > uProgress) discard;
    float head = smoothstep(uProgress - 0.07, uProgress, t) * uHead * step(uProgress, 0.995);
    float dash = 1.0;
    if (uDash > 0.0) dash = 0.45 + 0.55 * smoothstep(0.25, 0.75, fract(t * uDash - uTime * uSpeed));
    vec3 col = mix(uColor, uColorEnd, t) * (dash + head * 3.0);
    gl_FragColor = vec4(col, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export type TubeOptions = {
  radius?: number;
  color?: number;
  colorEnd?: number;
  intensity?: number;
  dash?: number;
  speed?: number;
  head?: number;
  progress?: number;
  opacity?: number;
  segments?: number;
  radial?: number;
};

export type GlowTube = THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial> & {
  setProgress(p: number): void;
};

export type ParticleCloud = THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> & {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  alphas: Float32Array;
  commit(): void;
};

/**
 * Shared factory for materials, textures and recurring meshes. Owns everything it
 * caches so a single dispose() releases the GPU resources it created.
 */
export class Kit {
  readonly fontFamily: string;
  readonly lowPower: boolean;
  private readonly owned = new Set<{ dispose(): void }>();
  private readonly glowCache = new Map<string, THREE.MeshBasicMaterial>();
  private readonly matCache = new Map<string, THREE.Material>();
  private radial?: THREE.CanvasTexture;
  /** Point-size scale, updated on resize so particles keep their world size. */
  readonly pointScale = { value: 600 };
  readonly time = { value: 0 };

  constructor(fontFamily: string, lowPower: boolean) {
    this.fontFamily = fontFamily;
    this.lowPower = lowPower;
  }

  own<T extends { dispose(): void }>(resource: T): T {
    this.owned.add(resource);
    return resource;
  }

  /** Unlit HDR colour: values above 1 feed the bloom pass and read as neon. */
  glow(hex: number, intensity = 2.5, opts: { opacity?: number; additive?: boolean; side?: THREE.Side } = {}) {
    const key = `${hex}|${intensity}|${opts.opacity ?? 1}|${opts.additive ? 1 : 0}|${opts.side ?? 0}`;
    let mat = this.glowCache.get(key);
    if (!mat) {
      const transparent = opts.opacity !== undefined || opts.additive === true;
      mat = this.own(
        new THREE.MeshBasicMaterial({
          color: hdr(hex, intensity),
          transparent,
          opacity: opts.opacity ?? 1,
          blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: !transparent,
          side: opts.side ?? THREE.FrontSide,
        }),
      );
      this.glowCache.set(key, mat);
    }
    return mat;
  }

  private cached<T extends THREE.Material>(key: string, make: () => T): T {
    let mat = this.matCache.get(key) as T | undefined;
    if (!mat) {
      mat = this.own(make());
      this.matCache.set(key, mat);
    }
    return mat;
  }

  /** Glossy black robot shell: the NEOBOT look comes from clearcoat reflections of the studio env. */
  shell(detail: "high" | "low" = "high") {
    return detail === "high" && !this.lowPower
      ? this.cached(
          "shell-high",
          () =>
            new THREE.MeshPhysicalMaterial({
              color: 0x0b0c14,
              metalness: 0.45,
              roughness: 0.2,
              clearcoat: 1,
              clearcoatRoughness: 0.06,
              envMapIntensity: 1.05,
            }),
        )
      : this.cached(
          "shell-low",
          () => new THREE.MeshStandardMaterial({ color: 0x0d0e17, metalness: 0.6, roughness: 0.24, envMapIntensity: 1 }),
        );
  }

  joint() {
    return this.cached(
      "joint",
      () => new THREE.MeshStandardMaterial({ color: 0x15161f, metalness: 0.55, roughness: 0.5, envMapIntensity: 0.55 }),
    );
  }

  visor() {
    return this.cached(
      "visor",
      () =>
        new THREE.MeshPhysicalMaterial({
          color: 0x04040a,
          metalness: 0.85,
          roughness: 0.05,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
          envMapIntensity: 1.35,
        }),
    );
  }

  /** Dark structural surface for platforms and buildings. */
  structure() {
    return this.cached(
      "structure",
      () =>
        new THREE.MeshStandardMaterial({ color: 0x0c0d1a, metalness: 0.55, roughness: 0.32, envMapIntensity: 0.45 }),
    );
  }

  rock() {
    return this.cached(
      "rock",
      () =>
        new THREE.MeshStandardMaterial({
          color: 0x161830,
          metalness: 0.1,
          roughness: 0.92,
          flatShading: true,
          envMapIntensity: 0.25,
        }),
    );
  }

  /** Soft radial falloff used for halos, under-glows and nebulae. */
  radialTexture() {
    if (!this.radial) {
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(255,255,255,0.55)");
      g.addColorStop(0.6, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      this.radial = this.own(new THREE.CanvasTexture(canvas));
      this.radial.colorSpace = THREE.SRGBColorSpace;
    }
    return this.radial;
  }

  /** Additive glow sprite (halo, under-glow, bloom accent). */
  halo(hex: number, scale: number, opacity = 0.5) {
    const mat = this.own(
      new THREE.SpriteMaterial({
        map: this.radialTexture(),
        color: hex,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(scale);
    return sprite;
  }

  /** Camera-facing text label in the display face, e.g. "ERP" floating over a node. */
  label(text: string, hex: number, height = 0.42, opts: { weight?: number; glow?: boolean } = {}) {
    const fontPx = 64;
    const pad = 28;
    const font = `${opts.weight ?? 600} ${fontPx}px ${this.fontFamily}`;
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.font = font;
    const width = Math.ceil(probe.measureText(text).width + pad * 2 + text.length * 6);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = fontPx + pad * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
    const css = `#${new THREE.Color(hex).getHexString()}`;
    if (opts.glow !== false) {
      ctx.shadowColor = css;
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, width / 2, canvas.height / 2 + 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = css;
    ctx.globalAlpha = 0.35;
    ctx.fillText(text, width / 2, canvas.height / 2 + 2);
    const tex = this.own(new THREE.CanvasTexture(canvas));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = this.own(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set((height * canvas.width) / canvas.height, height, 1);
    return sprite;
  }

  /** A tube of light along `curve` that can draw itself in (setProgress 0 → 1). */
  tube(curve: THREE.Curve<THREE.Vector3>, opts: TubeOptions = {}): GlowTube {
    const geometry = new THREE.TubeGeometry(
      curve,
      opts.segments ?? 96,
      opts.radius ?? 0.035,
      opts.radial ?? 6,
      false,
    );
    const intensity = opts.intensity ?? 2.4;
    const material = new THREE.ShaderMaterial({
      vertexShader: TUBE_VERT,
      fragmentShader: TUBE_FRAG,
      uniforms: {
        uColor: { value: hdr(opts.color ?? PALETTE.violet, intensity) },
        uColorEnd: { value: hdr(opts.colorEnd ?? opts.color ?? PALETTE.violet, intensity) },
        uProgress: { value: opts.progress ?? 1 },
        uTime: this.time,
        uOpacity: { value: opts.opacity ?? 1 },
        uDash: { value: opts.dash ?? 0 },
        uSpeed: { value: opts.speed ?? 0.6 },
        uHead: { value: opts.head ?? 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geometry, material) as unknown as GlowTube;
    mesh.setProgress = (p: number) => {
      material.uniforms.uProgress.value = p;
      mesh.visible = p > 0.001;
    };
    mesh.setProgress(opts.progress ?? 1);
    return mesh;
  }

  /** Soft additive particles; callers write into the typed arrays then commit(). */
  particles(count: number, opts: { twinkle?: number; opacity?: number } = {}): ParticleCloud {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count).fill(1);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: {
        uScale: this.pointScale,
        uOpacity: { value: opts.opacity ?? 1 },
        uTime: this.time,
        uTwinkle: { value: opts.twinkle ?? 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material) as unknown as ParticleCloud;
    points.frustumCulled = false;
    points.positions = positions;
    points.colors = colors;
    points.sizes = sizes;
    points.alphas = alphas;
    points.commit = () => {
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aColor.needsUpdate = true;
      geometry.attributes.aSize.needsUpdate = true;
      geometry.attributes.aAlpha.needsUpdate = true;
    };
    return points;
  }

  dispose() {
    for (const resource of this.owned) resource.dispose();
    this.owned.clear();
    this.glowCache.clear();
    this.matCache.clear();
    this.radial = undefined;
  }
}

/** Dense polyline → smooth curve; corners round slightly, like bent neon tubing. */
export function curveThrough(points: THREE.Vector3[], closed = false) {
  return new THREE.CatmullRomCurve3(points, closed, "centripetal");
}

/** A sagging cable / arcing beam between two points. */
export function arcBetween(a: THREE.Vector3, b: THREE.Vector3, lift: number, samples = 24) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.y += Math.sin(Math.PI * t) * lift;
    pts.push(p);
  }
  return curveThrough(pts);
}
