import * as THREE from "three";
import { Kit, PALETTE } from "../kit";

function canvasSprite(
  kit: Kit,
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  scale: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const texture = kit.own(new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = kit.own(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(scale);
  return sprite;
}

/** Red warning triangle, the chaos scene's recurring alarm. */
export function warningSprite(kit: Kit, scale = 0.9) {
  return canvasSprite(
    kit,
    128,
    (ctx, s) => {
      ctx.shadowColor = "#ff4d6d";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "#ff8197";
      ctx.lineWidth = 9;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(s / 2, s * 0.16);
      ctx.lineTo(s * 0.86, s * 0.82);
      ctx.lineTo(s * 0.14, s * 0.82);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(s / 2 - 5, s * 0.38, 10, s * 0.24);
      ctx.beginPath();
      ctx.arc(s / 2, s * 0.71, 6, 0, Math.PI * 2);
      ctx.fill();
    },
    scale,
  );
}

/** Teal check badge: an approval or a resolved risk. */
export function checkSprite(kit: Kit, scale = 0.7) {
  return canvasSprite(
    kit,
    128,
    (ctx, s) => {
      ctx.shadowColor = "#33bf92";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "#65d6b0";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s * 0.36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(s * 0.34, s * 0.52);
      ctx.lineTo(s * 0.46, s * 0.64);
      ctx.lineTo(s * 0.68, s * 0.38);
      ctx.stroke();
    },
    scale,
  );
}

/** A sheet of spreadsheet cells, for the paper storm. */
export function sheetTexture(kit: Kit) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#dfe4f5";
  ctx.fillRect(0, 0, 96, 128);
  ctx.fillStyle = "#9aa6d6";
  ctx.fillRect(0, 0, 96, 14);
  ctx.strokeStyle = "#a8b1d6";
  ctx.lineWidth = 1;
  for (let x = 0; x <= 96; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, 128);
    ctx.stroke();
  }
  for (let y = 14; y <= 128; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(96, y + 0.5);
    ctx.stroke();
  }
  const texture = kit.own(new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Small quad-rotor drone with a glowing eye, after the reference drone. */
export function buildDrone(kit: Kit, eye: number = PALETTE.violet) {
  const drone = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), kit.shell("low"));
  body.scale.set(1, 0.7, 1.15);
  drone.add(body);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), kit.glow(eye, 4));
  lens.position.set(0, 0, 0.2);
  drone.add(lens);
  const rotors: THREE.Mesh[] = [];
  for (const [x, z] of [
    [0.3, 0.3],
    [-0.3, 0.3],
    [0.3, -0.3],
    [-0.3, -0.3],
  ]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.42), kit.joint());
    arm.position.set(x / 2, 0, z / 2);
    arm.lookAt(x, 0, z);
    drone.add(arm);
    const rotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.01, 18),
      kit.glow(eye, 1.4, { opacity: 0.5 }),
    );
    rotor.position.set(x, 0.05, z);
    drone.add(rotor);
    rotors.push(rotor);
  }
  return { drone, spin: (t: number) => rotors.forEach((r, i) => (r.rotation.y = t * 30 + i)) };
}

export const tmpObject = new THREE.Object3D();
