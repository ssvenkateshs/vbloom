import { buildAutomate } from "./automate";
import { buildBloom } from "./bloom";
import { buildChallenge } from "./challenge";
import { buildConnect } from "./connect";
import { buildScale } from "./scale";
import { buildTransform } from "./transform";
import type { SceneBuilder } from "./types";

/** One builder per journey scene, in story order (matches `journey` in site.ts). */
export const SCENE_BUILDERS: SceneBuilder[] = [
  buildChallenge,
  buildConnect,
  buildTransform,
  buildAutomate,
  buildScale,
  buildBloom,
];

/** Island rim colour per scene: red chaos cooling to violet, blooming to teal. */
export const SCENE_RIMS = [0xff4d6d, 0x4cc9ff, 0x8b7cff, 0x8b7cff, 0xc06bff, 0x8b7cff];

export type { SceneHandle, SceneBuilder, SceneContext } from "./types";
