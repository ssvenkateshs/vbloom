/**
 * Choreography for the hero story: one continuous scene in which the same organisation
 * transforms over six chapters. Every actor has a pose per chapter; the renderer applies
 * the active pose and CSS transitions glide between them. No React, no DOM.
 *
 * Coordinates are in the scene's 560 x 520 viewBox, measured to each actor's centre.
 */

export const VIEW = { width: 560, height: 520 } as const;

/** Isometric projection used for the platform slabs. */
export const ISO = { kx: 30, ky: 17.3 } as const;

export type Pose = { x: number; y: number; s?: number; r?: number; o?: number };
type Track = readonly [Pose, Pose, Pose, Pose, Pose, Pose];

const off = (x: number, y: number, s = 0.4): Pose => ({ x, y, s, o: 0 });

/** Camera per chapter: chapter 4 and 5 zoom out to reveal the foundation and the apps. */
export const camera: readonly { s: number }[] = [
  { s: 1 },
  { s: 1 },
  { s: 1 },
  { s: 0.9 },
  { s: 0.88 },
  { s: 1 },
];

export type SystemId = "finance" | "operations" | "crm" | "projects" | "documents" | "data" | "iot";

/** The organisation's systems: scattered, then connected, then fed into data, then absorbed. */
export const systems: readonly { id: SystemId; icon: string; alert?: boolean; track: Track }[] = [
  {
    id: "finance",
    icon: "wallet",
    track: [
      { x: 122, y: 116, r: -5 },
      { x: 104, y: 168 },
      { x: 84, y: 96, s: 0.86 },
      { x: 244, y: 264, s: 0.42 },
      { x: 244, y: 300, s: 0.4 },
      off(280, 470, 0.2),
    ],
  },
  {
    id: "operations",
    icon: "gear",
    track: [
      { x: 440, y: 102, r: 4 },
      { x: 456, y: 168 },
      { x: 84, y: 158, s: 0.86 },
      { x: 316, y: 264, s: 0.42 },
      { x: 316, y: 300, s: 0.4 },
      off(280, 470, 0.2),
    ],
  },
  {
    id: "crm",
    icon: "users",
    alert: true,
    track: [
      { x: 104, y: 358, r: 3 },
      { x: 104, y: 356 },
      { x: 84, y: 220, s: 0.86 },
      { x: 316, y: 306, s: 0.42 },
      { x: 316, y: 342, s: 0.4 },
      off(280, 470, 0.2),
    ],
  },
  {
    id: "projects",
    icon: "kanban",
    alert: true,
    track: [
      { x: 452, y: 350, r: -3 },
      { x: 456, y: 356 },
      { x: 84, y: 282, s: 0.86 },
      { x: 244, y: 306, s: 0.42 },
      { x: 244, y: 342, s: 0.4 },
      off(280, 470, 0.2),
    ],
  },
  {
    id: "documents",
    icon: "doc",
    track: [
      { x: 292, y: 440, r: 2 },
      { x: 280, y: 462 },
      { x: 84, y: 344, s: 0.86 },
      { x: 280, y: 326, s: 0.42 },
      { x: 280, y: 362, s: 0.4 },
      off(280, 470, 0.2),
    ],
  },
  {
    id: "data",
    icon: "database",
    track: [
      { x: 286, y: 262, s: 1.04 },
      { x: 280, y: 62 },
      off(300, 262, 0.5),
      off(280, 284, 0.4),
      off(280, 320, 0.4),
      off(280, 470, 0.2),
    ],
  },
  {
    id: "iot",
    icon: "sensor",
    track: [
      off(84, 470),
      off(84, 470),
      { x: 84, y: 406, s: 0.86 },
      { x: 280, y: 244, s: 0.42 },
      { x: 280, y: 280, s: 0.4 },
      off(280, 470, 0.2),
    ],
  },
];

/** The AI core arrives in chapter 2 and stays above everything it connects. */
export const orb: Track = [
  off(280, 262, 0.2),
  { x: 280, y: 262 },
  { x: 300, y: 136, s: 0.62 },
  { x: 280, y: 166, s: 0.66 },
  { x: 280, y: 92, s: 0.56 },
  { x: 280, y: 66, s: 0.56 },
];

/** AI capabilities that orbit the core in chapter 2. */
export const aiChips: readonly { icon: string; track: Track }[] = [
  {
    icon: "search",
    track: [off(280, 262), { x: 280, y: 150 }, off(300, 136), off(280, 166), off(280, 92), off(280, 66)],
  },
  {
    icon: "bot",
    track: [off(280, 262), { x: 444, y: 263 }, off(300, 136), off(280, 166), off(280, 92), off(280, 66)],
  },
  {
    icon: "doc",
    track: [off(280, 262), { x: 280, y: 374 }, off(300, 136), off(280, 166), off(280, 92), off(280, 66)],
  },
  {
    icon: "loop",
    track: [off(280, 262), { x: 116, y: 263 }, off(300, 136), off(280, 166), off(280, 92), off(280, 66)],
  },
];

export type PlateId = "cloud" | "data" | "apps";

/** Platform slabs: data appears first, the cloud foundation materialises underneath, apps go on top. */
export const plates: readonly { id: PlateId; size: number; track: Track }[] = [
  {
    id: "cloud",
    size: 7,
    track: [
      off(280, 470, 0.9),
      off(280, 470, 0.9),
      off(280, 470, 0.9),
      { x: 280, y: 400 },
      { x: 280, y: 410 },
      { x: 280, y: 306, s: 0.56 },
    ],
  },
  {
    id: "data",
    size: 4.2,
    track: [
      off(290, 300, 0.7),
      off(280, 300, 0.7),
      { x: 300, y: 268 },
      { x: 280, y: 284 },
      { x: 280, y: 320 },
      { x: 280, y: 268, s: 0.6 },
    ],
  },
  {
    id: "apps",
    size: 3,
    track: [
      off(280, 160, 0.7),
      off(280, 160, 0.7),
      off(280, 160, 0.7),
      off(280, 150, 0.7),
      { x: 280, y: 236 },
      { x: 280, y: 238, s: 0.62 },
    ],
  },
];

/** Analytics output of the data chapter. */
export const analytics: { dashboard: Track; forecast: Track } = {
  dashboard: [
    off(470, 150),
    off(470, 150),
    { x: 466, y: 146 },
    off(300, 268, 0.3),
    off(280, 320, 0.3),
    off(98, 170, 0.3),
  ],
  forecast: [
    off(470, 390),
    off(470, 390),
    { x: 466, y: 392 },
    off(300, 268, 0.3),
    off(280, 320, 0.3),
    off(98, 170, 0.3),
  ],
};

/** Labels around the cloud foundation in chapter 4. */
export const foundationParts: readonly { icon: string; track: Track }[] = [
  {
    icon: "apps",
    track: [off(280, 400), off(280, 400), off(280, 400), { x: 96, y: 352 }, off(96, 380), off(462, 170, 0.3)],
  },
  {
    icon: "shield",
    track: [
      off(280, 400),
      off(280, 400),
      off(280, 400),
      { x: 464, y: 352 },
      off(464, 380),
      off(462, 170, 0.3),
    ],
  },
  {
    icon: "network",
    track: [
      off(280, 400),
      off(280, 400),
      off(280, 400),
      { x: 128, y: 452 },
      off(128, 470),
      off(462, 170, 0.3),
    ],
  },
  {
    icon: "layers",
    track: [
      off(280, 400),
      off(280, 400),
      off(280, 400),
      { x: 432, y: 452 },
      off(432, 470),
      off(462, 170, 0.3),
    ],
  },
  {
    icon: "server",
    track: [
      off(280, 400),
      off(280, 400),
      off(280, 400),
      { x: 280, y: 520 },
      off(280, 540),
      off(462, 170, 0.3),
    ],
  },
];

export type DeviceId = "laptop" | "phone" | "tablet" | "dashboard";

/** Digital experiences that appear above the architecture in chapter 5. */
export const devices: readonly { id: DeviceId; track: Track }[] = [
  {
    id: "laptop",
    track: [
      off(280, 200),
      off(280, 200),
      off(280, 200),
      off(280, 200),
      { x: 280, y: 180 },
      off(98, 360, 0.25),
    ],
  },
  {
    id: "phone",
    track: [
      off(150, 214),
      off(150, 214),
      off(150, 214),
      off(150, 214),
      { x: 128, y: 214, r: -4 },
      off(98, 360, 0.25),
    ],
  },
  {
    id: "tablet",
    track: [
      off(420, 226),
      off(420, 226),
      off(420, 226),
      off(420, 226),
      { x: 436, y: 232, r: 4 },
      off(98, 360, 0.25),
    ],
  },
  {
    id: "dashboard",
    track: [
      off(450, 110),
      off(450, 110),
      off(450, 110),
      off(450, 110),
      { x: 452, y: 92 },
      off(98, 360, 0.25),
    ],
  },
];

/** Integration APIs pill in chapter 5. */
export const apiPill: Track = [
  off(110, 330),
  off(110, 330),
  off(110, 330),
  off(110, 330),
  { x: 110, y: 340 },
  off(98, 360, 0.3),
];

/** The connected enterprise in chapter 6: six satellites around the business. */
export const satellites: readonly { icon: string; track: Track }[] = [
  {
    icon: "spark",
    track: [off(280, 262), off(280, 262), off(280, 262), off(280, 262), off(280, 262), { x: 280, y: 126 }],
  },
  {
    icon: "chart",
    track: [off(280, 262), off(280, 262), off(280, 262), off(280, 262), off(280, 262), { x: 96, y: 186 }],
  },
  {
    icon: "cloud",
    track: [off(280, 262), off(280, 262), off(280, 262), off(280, 262), off(280, 262), { x: 464, y: 186 }],
  },
  {
    icon: "apps",
    track: [off(280, 262), off(280, 262), off(280, 262), off(280, 262), off(280, 262), { x: 96, y: 372 }],
  },
  {
    icon: "loop",
    track: [off(280, 262), off(280, 262), off(280, 262), off(280, 262), off(280, 262), { x: 464, y: 372 }],
  },
  {
    icon: "nodes",
    track: [off(280, 262), off(280, 262), off(280, 262), off(280, 262), off(280, 262), { x: 280, y: 462 }],
  },
];

export const corePill: Track = [
  off(280, 300),
  off(280, 300),
  off(280, 300),
  off(280, 300),
  off(280, 300),
  { x: 280, y: 346 },
];

/** Plate labels sit on the slab's front corner, so they share the plate's track. */

export type LinkKind = "broken" | "weak" | "flow" | "beam" | "rail";
export type Link = { from: [number, number]; to: [number, number]; kind: LinkKind; bend?: number };

const at = (track: Track, chapter: number): [number, number] => [track[chapter].x, track[chapter].y];
const sys = (id: SystemId) => systems.find((system) => system.id === id)!.track;
const plate = (id: PlateId) => plates.find((p) => p.id === id)!.track;

/** Connections drawn in each chapter. They fade in once the actors have settled. */
export const links: readonly (readonly Link[])[] = [
  [
    { from: at(sys("finance"), 0), to: at(sys("data"), 0), kind: "broken", bend: 0.12 },
    { from: at(sys("crm"), 0), to: at(sys("data"), 0), kind: "broken", bend: -0.1 },
    { from: at(sys("projects"), 0), to: at(sys("data"), 0), kind: "broken", bend: 0.14 },
    { from: at(sys("operations"), 0), to: at(sys("projects"), 0), kind: "broken", bend: -0.12 },
    { from: at(sys("operations"), 0), to: at(sys("data"), 0), kind: "weak", bend: -0.1 },
    { from: at(sys("documents"), 0), to: at(sys("data"), 0), kind: "weak", bend: 0.1 },
    { from: at(sys("crm"), 0), to: at(sys("documents"), 0), kind: "weak", bend: 0.16 },
  ],
  (["finance", "operations", "crm", "projects", "documents", "data"] as const).map((id) => ({
    from: at(orb, 1),
    to: at(sys(id), 1),
    kind: "beam" as const,
  })),
  [
    ...(["finance", "operations", "crm", "projects", "documents", "iot"] as const).map((id, index) => ({
      from: at(sys(id), 2),
      to: [222, 262 + (index - 2.5) * 7] as [number, number],
      kind: "flow" as const,
      bend: (index - 2.5) * 0.05,
    })),
    { from: [372, 250], to: at(analytics.dashboard, 2), kind: "flow", bend: -0.18 },
    { from: [372, 286], to: at(analytics.forecast, 2), kind: "flow", bend: 0.18 },
    { from: at(orb, 2), to: [300, 232], kind: "beam" },
  ],
  [
    { from: at(orb, 3), to: [280, 262], kind: "beam" },
    { from: [154, 288], to: [154, 404], kind: "rail" },
    { from: [406, 288], to: [406, 404], kind: "rail" },
    { from: [280, 356], to: [280, 476], kind: "rail" },
  ],
  [
    { from: at(orb, 4), to: [280, 140], kind: "beam" },
    { from: [190, 238], to: [190, 322], kind: "rail" },
    { from: [370, 238], to: [370, 322], kind: "rail" },
    { from: [154, 326], to: [154, 414], kind: "rail" },
    { from: [406, 326], to: [406, 414], kind: "rail" },
    { from: at(apiPill, 4), to: [222, 214], kind: "flow", bend: -0.2 },
    { from: [344, 186], to: at(devices[2].track, 4), kind: "flow", bend: -0.15 },
    { from: [344, 160], to: at(devices[3].track, 4), kind: "flow", bend: 0.15 },
    { from: [214, 196], to: at(devices[1].track, 4), kind: "flow", bend: 0.15 },
  ],
  [
    ...satellites.map((satellite) => ({
      from: [280, 262] as [number, number],
      to: at(satellite.track, 5),
      kind: "flow" as const,
    })),
    { from: at(orb, 5), to: at(satellites[0].track, 5), kind: "beam" },
  ],
];

export const plateTrack = plate;
