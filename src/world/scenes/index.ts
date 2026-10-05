import * as THREE from "three";
import type { SceneBuilder } from "./types";

const placeholder: SceneBuilder = () => ({
  hold: new THREE.Vector3(5, 5.5, 13.5),
  focus: new THREE.Vector3(0, 1.6, 0),
  update: () => {},
});

/** One builder per journey scene, in story order. */
export const SCENE_BUILDERS: SceneBuilder[] = [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder];

/** Island rim colour per scene: red chaos cooling to violet, blooming to teal. */
export const SCENE_RIMS = [0xff4d6d, 0x4cc9ff, 0x8b7cff, 0x8b7cff, 0xc06bff, 0x33bf92];

export type { SceneHandle, SceneBuilder, SceneContext } from "./types";
