import type * as THREE from "three";
import type { Island } from "../island";
import type { Kit } from "../kit";

export type SceneContext = {
  kit: Kit;
  island: Island;
  reducedMotion: boolean;
};

export type SceneHandle = {
  /** Camera position at the scene's hold pose, relative to the island centre. */
  hold: THREE.Vector3;
  /** What the camera looks at while holding, relative to the island centre. */
  focus: THREE.Vector3;
  /**
   * Called every frame while the scene is near the camera. `intro` runs 0 → 1 over a
   * few seconds when the visitor arrives (the autoplay) and resets once they are far away.
   */
  update(dt: number, t: number, intro: number): void;
};

export type SceneBuilder = (ctx: SceneContext) => SceneHandle;
