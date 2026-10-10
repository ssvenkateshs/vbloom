type IconProps = { className?: string };

/**
 * Line icons drawn on a 24px grid so stroke weight stays consistent. Kept as raw path
 * data so the hero scene can draw the same glyphs inside its own SVG.
 */
export const iconPaths = {
  cloud: ["M7.2 18.5h9.9a3.9 3.9 0 0 0 .55-7.76 5.6 5.6 0 0 0-10.72-1.5A4.13 4.13 0 0 0 7.2 18.5Z"],
  code: ["M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"],
  spark: [
    "M12 3.5l1.65 4.6a3 3 0 0 0 1.75 1.78L20 11.5l-4.6 1.65a3 3 0 0 0-1.78 1.75L12 19.5l-1.65-4.6a3 3 0 0 0-1.75-1.78L4 11.5l4.6-1.65a3 3 0 0 0 1.78-1.75Z",
  ],
  compass: ["M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z", "M14.8 9.2l-1.6 4-4 1.6 1.6-4Z"],
  shield: ["M12 3.5l7 2.4v5.3c0 4-2.8 7.5-7 9.3-4.2-1.8-7-5.3-7-9.3V5.9Z", "m9.2 12 2 2 3.8-4"],
  chart: ["M4.5 19.5h15", "M7.5 16v-4", "M12 16V8", "M16.5 16v-6.5"],
  nodes: [
    "M6 3.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z",
    "M18 3.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z",
    "M12 15.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z",
    "M8.2 6h7.6M7.1 7.9l3.8 8M16.9 7.9l-3.8 8",
  ],
  chat: [
    "M6.5 4.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4.5 3.5v-3.5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z",
    "M9 10h.01M12 10h.01M15 10h.01",
  ],
  loop: ["M19 12a7 7 0 0 1-12.2 4.7", "M5 12a7 7 0 0 1 12.2-4.7", "M17.6 3.8v3.6H14", "M6.4 20.2v-3.6H10"],
  doc: [
    "M7 3.5h6.5L18 8v11a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z",
    "M13.5 3.5V8H18",
    "M8.5 12.5h7M8.5 16h5",
  ],
  headset: [
    "M5 13.5V12a7 7 0 0 1 14 0v1.5",
    "M5 13.5h2.5v5H6a1 1 0 0 1-1-1Z",
    "M19 13.5h-2.5v5H18a1 1 0 0 0 1-1Z",
    "M16.5 18.5c0 1.2-1.6 2-4 2",
  ],
  building: [
    "M4.5 20.5h15",
    "M6.5 20.5v-15a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15",
    "M14.5 9.5h3a1 1 0 0 1 1 1v10",
    "M9 8h3M9 11.5h3M9 15h3",
  ],
  bank: ["M4 9.5 12 4.5l8 5", "M5 20h14", "M6.5 10.5v7M10 10.5v7M14 10.5v7M17.5 10.5v7"],
  factory: ["M3.5 20h17", "M4.5 20v-8.5l5 3v-3l5 3V5h4v15", "M8 17h1.5M12 17h1.5"],
  pulse: ["M3.5 12.5h4l2-4.5 3.5 9 2-4.5h5.5"],
  bag: ["M6 8h12l-1 11.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9Z", "M9 10V7a3 3 0 0 1 6 0v3"],
  landmark: ["M4 20h16", "M12 3.8 19 8.5H5Z", "M7 11.5v5.5M12 11.5v5.5M17 11.5v5.5"],
  wallet: [
    "M4.5 7.5a2 2 0 0 1 2-2H17v3",
    "M4.5 7.5v10a2 2 0 0 0 2 2h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-12a2 2 0 0 1-2-2Z",
    "M15.5 14h.01",
  ],
  gear: [
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
    "M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6",
  ],
  users: [
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M3.8 19a5.2 5.2 0 0 1 10.4 0",
    "M15.5 5.3a3 3 0 0 1 0 5.4",
    "M17 13.6a5.2 5.2 0 0 1 3.2 5.4",
  ],
  kanban: [
    "M5 4.5h14a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5Z",
    "M9.5 4.5v15M14.5 4.5v15",
    "M6.5 8h1.5M11 8h2M11 11h2M16 8h1.5",
  ],
  database: [
    "M12 4c4.1 0 7 1.2 7 2.7S16.1 9.4 12 9.4 5 8.2 5 6.7 7.9 4 12 4Z",
    "M5 6.7v10.6c0 1.5 2.9 2.7 7 2.7s7-1.2 7-2.7V6.7",
    "M5 12c0 1.5 2.9 2.7 7 2.7s7-1.2 7-2.7",
  ],
  sensor: [
    "M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
    "M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7",
    "M5.8 18.2a8.8 8.8 0 0 1 0-12.4M18.2 5.8a8.8 8.8 0 0 1 0 12.4",
  ],
  bot: [
    "M7 8.5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z",
    "M12 8.5v-3M12 4.5h.01",
    "M9.5 13h.01M14.5 13h.01M10 16h4",
  ],
  network: [
    "M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    "M5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    "M19 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    "M12 8v4m0 0-5.4 4.3M12 12l5.4 4.3",
  ],
  layers: ["M12 4 20 8.5 12 13 4 8.5Z", "M4 12.5 12 17l8-4.5", "M4 16.2 12 20.7l8-4.5"],
  server: [
    "M5.5 4.5h13a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z",
    "M5.5 13.5h13a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z",
    "M8 7.5h.01M8 16.5h.01",
  ],
  apps: ["M5 5h5v5H5ZM14 5h5v5h-5ZM5 14h5v5H5ZM14 14h5v5h-5Z"],
  search: ["M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z", "m15 15 4.5 4.5"],
} as const;

export type IconName = keyof typeof iconPaths;

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {iconPaths[name].map((d) => (
        <path
          style={{ stroke: "currentColor" }}
          key={d}
          d={d}

          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        style={{ stroke: "currentColor" }}
        d="M5 12h14m-5.5-6 6 6-6 6"

        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        style={{ stroke: "currentColor" }}
        d="m5 12.5 4.2 4L19 7"

        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayPause({ playing, className = "h-4 w-4" }: IconProps & { playing: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {playing ? (
        <path d="M7.5 5h3v14h-3zM13.5 5h3v14h-3z" />
      ) : (
        <path d="M8 5.5v13a.6.6 0 0 0 .9.5l10-6.5a.6.6 0 0 0 0-1l-10-6.5a.6.6 0 0 0-.9.5Z" />
      )}
    </svg>
  );
}

/**
 * The VBloom mark: two palms whose trunks form a V; the right trunk doubles as the
 * stem of a B, with mint coconuts in its crown.
 */
export function Logo({ className = "h-8 w-8" }: IconProps) {
  const left = { stroke: "var(--color-bloom-500)" };
  const right = { stroke: "var(--color-brand-500)" };
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path style={left} strokeWidth="4.5" d="M24 60C21 46 17 32 12 20" />
      <g style={left} strokeWidth="3.5">
        <path d="M12 20C8 14 3 14 1 18" />
        <path d="M12 20C11 12 7 8 2 7" />
        <path d="M12 20C15 12 20 10 25 12" />
      </g>
      <path style={right} strokeWidth="4.5" d="M28 60C33 44 38 28 42 14" />
      <path style={right} strokeWidth="4.5" d="M39 24C52 24 53 39 34.5 40C56 40 55 60 28 60" />
      <g style={right} strokeWidth="3.5">
        <path d="M42 14C38 8 33 7 29 9" />
        <path d="M42 14C43 7 47 3 52 3" />
        <path d="M42 14C48 9 55 10 59 14" />
      </g>
      <circle style={{ fill: "var(--color-mint-400)" }} cx="40" cy="18.5" r="2.6" />
      <circle style={{ fill: "var(--color-mint-400)" }} cx="44.8" cy="18" r="2.6" />
    </svg>
  );
}

/**
 * A soft rosette of overlapping translucent circles behind a white glyph, used for
 * feature icons on the light surfaces.
 */
export function Rosette({
  name,
  tone = "brand",
  className = "h-20 w-20",
}: {
  name: IconName;
  tone?: "brand" | "mint";
  className?: string;
}) {
  const colors =
    tone === "mint"
      ? ["var(--color-mint-400)", "var(--color-mint-500)"]
      : ["var(--color-bloom-500)", "var(--color-brand-500)"];
  const offsets = [
    [-5, -4],
    [5, -5],
    [5, 5],
    [-5, 4],
  ];
  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 80" aria-hidden="true">
        {offsets.map(([dx, dy], index) => (
          <circle
            style={{ fill: colors[index % 2] }}
            key={index}
            cx={40 + dx}
            cy={40 + dy}
            r="27"
            opacity="0.22"
          />
        ))}
        <circle style={{ fill: colors[1] }} cx="40" cy="40" r="21" />
      </svg>
      <Icon name={name} className="relative h-[34%] w-[34%] text-white" />
    </span>
  );
}
