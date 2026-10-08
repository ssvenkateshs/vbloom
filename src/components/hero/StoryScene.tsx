import { useId, type ReactNode } from "react";
import { iconPaths, type IconName } from "@/components/Icons";
import { sceneLabels } from "@/content/site";
import {
  aiChips,
  analytics,
  apiPill,
  camera,
  corePill,
  devices,
  foundationParts,
  ISO,
  links,
  orb,
  plates,
  satellites,
  systems,
  VIEW,
  type DeviceId,
  type Link,
  type Pose,
} from "./scene";

/** Inline style for an actor in a given pose; CSS transitions do the in-betweening. */
function pose({ x, y, s = 1, r = 0, o = 1 }: Pose) {
  return { transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`, opacity: o };
}

function Glyph({
  name,
  size = 20,
  color = "#fff",
  width = 1.7,
}: {
  name: string;
  size?: number;
  color?: string;
  width?: number;
}) {
  const scale = size / 24;
  return (
    <g transform={`translate(${-size / 2} ${-size / 2}) scale(${scale})`}>
      {iconPaths[name as IconName].map((d) => (
        <path
          style={{ fill: "none", stroke: color }}
          key={d}
          d={d}

          strokeWidth={width / scale > 2.4 ? 2.4 : width / scale}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

function Actor({
  at,
  children,
  bob,
  className = "",
}: {
  at: Pose;
  children: ReactNode;
  bob?: number;
  className?: string;
}) {
  return (
    <g className={`actor ${className}`} style={pose(at)}>
      {bob === undefined ? (
        children
      ) : (
        <g className="bob" style={{ animationDelay: `${-bob}s` }}>
          {children}
        </g>
      )}
    </g>
  );
}

/** A curved connection; broken links stop short with a fault marker. */
function LinkPath({
  link,
  on,
  ids,
  index,
}: {
  link: Link;
  on: boolean;
  ids: Record<string, string>;
  index: number;
}) {
  const [x1, y1] = link.from;
  const [x2, y2] = link.to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const bend = link.bend ?? 0;
  const cx = mx - (y2 - y1) * bend;
  const cy = my + (x2 - x1) * bend;
  const d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
  const cls = `link ${on ? "is-on" : ""}`;
  const style = { opacity: on ? 1 : 0 };

  if (link.kind === "broken") {
    // Point on the curve at t = 0.5, where the connection fails.
    const bx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
    const by = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
    return (
      <g className={cls} style={style}>
        <path
          style={{ fill: "none", stroke: "#ff8a6b" }}
          d={d}

          strokeOpacity="0.55"
          strokeWidth="1.4"
          strokeDasharray="5 6"
          pathLength={100}
          strokeDashoffset="0"
          mask={`url(#${ids.gap}-${index})`}
        />
        <mask
          id={`${ids.gap}-${index}`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={VIEW.width}
          height={VIEW.height}
        >
          <rect style={{ fill: "#fff" }} width={VIEW.width} height={VIEW.height} />
          <circle style={{ fill: "#000" }} cx={bx} cy={by} r="14" />
        </mask>
        <g className="blink" transform={`translate(${bx} ${by})`}>
          <circle style={{ fill: "#2a1422", stroke: "#ff8a6b" }} r="7.5" strokeWidth="1.2" />
          <path
            style={{ stroke: "#ff8a6b" }}
            d="M-2.6 -2.6l5.2 5.2M2.6 -2.6l-5.2 5.2"

            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </g>
    );
  }

  if (link.kind === "rail") {
    return (
      <g className={cls} style={style}>
        <path
          style={{ fill: "none", stroke: "var(--color-bloom-500)" }}
          d={d}

          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeDasharray="2 5"
        />
      </g>
    );
  }

  const weak = link.kind === "weak";
  const beam = link.kind === "beam";
  const color = weak ? "var(--color-ink-faint)" : beam ? "var(--color-bloom-400)" : "var(--color-mint-400)";
  return (
    <g className={cls} style={style}>
      <path
        style={{ fill: "none", stroke: color }}
        d={d}

        strokeOpacity={weak ? 0.3 : 0.22}
        strokeWidth={beam ? 5 : 3}
        strokeLinecap="round"
      />
      <path
        style={{ fill: "none", stroke: color }}
        d={d}

        strokeOpacity={weak ? 0.6 : 0.95}
        strokeWidth="1.4"
        className="flow"
        strokeLinecap="round"
      />
      {!weak && (
        <circle style={{ fill: "#fff" }} r="2.8">
          <animateMotion
            dur={beam ? "1.6s" : "2.2s"}
            begin={`${-(index % 4) * 0.55}s`}
            repeatCount="indefinite"
            path={d}
          />
        </circle>
      )}
    </g>
  );
}

function SystemCard({
  label,
  icon,
  alert,
  alertOn,
  ids,
}: {
  label: string;
  icon: string;
  alert?: boolean;
  alertOn: boolean;
  ids: Record<string, string>;
}) {
  const w = Math.max(132, Math.round(label.length * 8.8 + 70));
  const left = -w / 2;
  return (
    <g>
      <rect
        style={{ fill: `url(#${ids.card})`, stroke: "#ffffff" }}
        x={left}
        y="-24"
        width={w}
        height="48"
        rx="14"

        strokeOpacity="0.14"
      />
      <rect style={{ fill: `url(#${ids.tile})` }} x={left + 9} y="-15" width="30" height="30" rx="9" />
      <g transform={`translate(${left + 24} 0)`}>
        <Glyph name={icon} size={18} />
      </g>
      <text style={{ fill: "var(--color-on-dark)" }} x={left + 50} y="5" fontSize="15" fontWeight="600">
        {label}
      </text>
      {alert && (
        <g
          transform={`translate(${-left - 6} -21)`}
          style={{ opacity: alertOn ? 1 : 0, transition: "opacity .5s" }}
        >
          <circle style={{ fill: "#ff8a6b" }} r="9" />
          <text style={{ fill: "#2a1422" }} y="4.2" textAnchor="middle" fontSize="12" fontWeight="800">
            !
          </text>
        </g>
      )}
    </g>
  );
}

function Pill({
  label,
  icon,
  ids,
  strong,
  size = 13,
}: {
  label: string;
  icon: string;
  ids: Record<string, string>;
  strong?: boolean;
  size?: number;
}) {
  const spacing = strong ? 1.6 : 0;
  const width = Math.round(label.length * (size * 0.62 + spacing) + 52);
  return (
    <g>
      <rect
        style={{
          fill: strong ? `url(#${ids.tile})` : "var(--color-night-800)",
          stroke: strong ? "var(--color-brand-200)" : "var(--color-bloom-500)",
        }}
        x={-width / 2}
        y="-17"
        width={width}
        height="34"
        rx="17"

        strokeOpacity={strong ? 0.5 : 0.45}
      />
      <g transform={`translate(${-width / 2 + 19} 0)`}>
        <Glyph name={icon} size={15} color={strong ? "#fff" : "var(--color-mint-400)"} />
      </g>
      <text
        style={{ fill: "var(--color-on-dark)" }}
        x={-width / 2 + 34}
        y={size * 0.36}
        fontSize={size}
        fontWeight="650"

        letterSpacing={spacing}
      >
        {label}
      </text>
    </g>
  );
}

function Plate({ size, label, ids }: { size: number; label: string; ids: Record<string, string> }) {
  const w = size * ISO.kx;
  const h = size * ISO.ky;
  const t = 12;
  const grid: string[] = [];
  for (let i = 1; i < Math.round(size); i++) {
    const u = -size / 2 + (i * size) / Math.round(size);
    // Lines of constant u and constant v across the slab's top face.
    grid.push(
      `M${(u + size / 2) * ISO.kx} ${(u - size / 2) * ISO.ky} L${(u - size / 2) * ISO.kx} ${(u + size / 2) * ISO.ky}`,
    );
    grid.push(
      `M${(-size / 2 - u) * ISO.kx} ${(-size / 2 + u) * ISO.ky} L${(size / 2 - u) * ISO.kx} ${(size / 2 + u) * ISO.ky}`,
    );
  }
  return (
    <g>
      <ellipse
        style={{ fill: `url(#${ids.halo})` }}
        cx="0"
        cy={t + 8}
        rx={w * 1.05}
        ry={h * 1.05}
        opacity="0.5"
      />
      <path style={{ fill: "var(--color-night-900)" }} d={`M${-w} 0 L0 ${h} L0 ${h + t} L${-w} ${t} Z`} />
      <path style={{ fill: "var(--color-night-800)" }} d={`M0 ${h} L${w} 0 L${w} ${t} L0 ${h + t} Z`} />
      <path
        style={{ fill: `url(#${ids.plate})`, stroke: "var(--color-brand-400)" }}
        d={`M0 ${-h} L${w} 0 L0 ${h} L${-w} 0 Z`}

        strokeOpacity="0.5"
      />
      {grid.map((d) => (
        <path style={{ stroke: "var(--color-bloom-500)" }} key={d} d={d} strokeOpacity="0.12" />
      ))}
      <path
        style={{ fill: "none", stroke: `url(#${ids.edge})` }}
        d={`M${-w} 0 L0 ${h} L${w} 0`}
        strokeWidth="1.8"
      />
      <text
        style={{ fill: "var(--color-brand-200)" }}
        x="0"
        y={h * 0.62}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        letterSpacing="3"

        fillOpacity="0.75"
      >
        {label}
      </text>
    </g>
  );
}

function Orb({ ids }: { ids: Record<string, string> }) {
  const ring = "M-56 0a56 18 0 1 0 112 0a56 18 0 1 0 -112 0";
  return (
    <g>
      <circle style={{ fill: `url(#${ids.halo})` }} r="84" />
      <path
        style={{ fill: "none", stroke: "var(--color-bloom-400)" }}
        d={ring}
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <circle style={{ fill: `url(#${ids.core})` }} r="32" />
      <path
        style={{ fill: "none", stroke: "var(--color-brand-200)" }}
        d={ring}
        strokeWidth="1.6"
        className="flow"
      />
      <circle style={{ fill: "var(--color-mint-400)" }} r="3.5">
        <animateMotion dur="4s" repeatCount="indefinite" path={ring} />
      </circle>
      <Glyph name="spark" size={22} />
    </g>
  );
}

function Chip({ title, body, icon }: { title: string; body: string; icon: string }) {
  return (
    <g>
      <rect
        style={{ fill: "var(--color-night-700)", stroke: "var(--color-bloom-400)" }}
        x="-104"
        y="-25"
        width="208"
        height="50"
        rx="14"

        fillOpacity="0.92"

        strokeOpacity="0.5"
      />
      <circle style={{ fill: "var(--color-brand-500)" }} cx="-82" cy="0" r="13" />
      <g transform="translate(-82 0)">
        <Glyph name={icon} size={15} />
      </g>
      <text style={{ fill: "var(--color-on-dark)" }} x="-60" y="-2" fontSize="12" fontWeight="700">
        {title}
      </text>
      <text style={{ fill: "var(--color-on-dark-muted)" }} className="detail" x="-60" y="13" fontSize="9.5">
        {body}
      </text>
    </g>
  );
}

function Dashboard({ ids }: { ids: Record<string, string> }) {
  const bars = [26, 40, 32, 52, 46, 64];
  return (
    <g>
      <rect
        style={{ fill: `url(#${ids.card})`, stroke: "#ffffff" }}
        x="-80"
        y="-60"
        width="160"
        height="120"
        rx="14"

        strokeOpacity="0.14"
      />
      <text style={{ fill: "var(--color-on-dark)" }} x="-64" y="-36" fontSize="12" fontWeight="700">
        {sceneLabels.data.analytics}
      </text>
      {bars.map((height, index) => (
        <rect
          style={{ fill: "var(--color-brand-500)" }}
          key={index}
          x={-62 + index * 21}
          y={44 - height}
          width="12"
          height={height}
          rx="3"

          fillOpacity={0.5 + index * 0.08}
        />
      ))}
      <path
        style={{ fill: "none", stroke: "var(--color-mint-400)" }}
        d="M-58 22 L-36 10 L-16 16 L6 -2 L26 4 L54 -20"

        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle style={{ fill: "var(--color-mint-400)" }} cx="54" cy="-20" r="3.5" />
    </g>
  );
}

function Forecast({ ids }: { ids: Record<string, string> }) {
  return (
    <g>
      <rect
        style={{ fill: `url(#${ids.card})`, stroke: "#ffffff" }}
        x="-80"
        y="-34"
        width="160"
        height="68"
        rx="14"

        strokeOpacity="0.14"
      />
      <text style={{ fill: "var(--color-on-dark)" }} x="-64" y="-10" fontSize="12" fontWeight="700">
        {sceneLabels.data.forecast}
      </text>
      <text style={{ fill: "var(--color-on-dark-muted)" }} x="-64" y="8" fontSize="10" className="detail">
        {sceneLabels.data.insight}
      </text>
      <path
        style={{ fill: "none", stroke: "var(--color-mint-400)" }}
        d="M4 18 L20 10 L34 14 L50 -2 L64 -12"

        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        style={{ fill: "none", stroke: "var(--color-mint-400)" }}
        d="M50 -2 L64 -12"
        strokeWidth="2"
        strokeDasharray="2 4"
      />
      <path
        style={{ fill: "none", stroke: "var(--color-mint-400)" }}
        d="M58 -14 L66 -13 L64 -5"

        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Screen({ x, y, w, h, r }: { x: number; y: number; w: number; h: number; r: number }) {
  return (
    <g>
      <rect
        style={{ fill: "var(--color-night-800)", stroke: "var(--color-bloom-400)" }}
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        strokeOpacity="0.55"
      />
      <rect
        style={{ fill: "var(--color-bloom-500)" }}
        x={x + 8}
        y={y + 9}
        width={w * 0.38}
        height="5"
        rx="2.5"
        fillOpacity="0.8"
      />
      <rect
        style={{ fill: "var(--color-brand-500)" }}
        x={x + 8}
        y={y + 20}
        width={w - 16}
        height={h * 0.26}
        rx="4"
        fillOpacity="0.35"
      />
      <rect
        style={{ fill: "var(--color-mint-400)" }}
        x={x + 8}
        y={y + 26 + h * 0.26}
        width={(w - 22) / 2}
        height={h * 0.2}
        rx="4"

        fillOpacity="0.35"
      />
      <rect
        style={{ fill: "#ffffff" }}
        x={x + 14 + (w - 22) / 2}
        y={y + 26 + h * 0.26}
        width={(w - 22) / 2}
        height={h * 0.2}
        rx="4"

        fillOpacity="0.1"
      />
    </g>
  );
}

function Device({ id }: { id: DeviceId }) {
  const caption = sceneLabels.build.devices[id];
  const label = (y: number) => (
    <text
      style={{ fill: "var(--color-on-dark-muted)" }}
      className="detail"
      y={y}
      textAnchor="middle"
      fontSize="11"
      fontWeight="600"
    >
      {caption}
    </text>
  );
  if (id === "laptop") {
    return (
      <g>
        <Screen x={-72} y={-56} w={144} h={88} r={8} />
        <path
          style={{ fill: "var(--color-night-600)", stroke: "var(--color-bloom-400)" }}
          d="M-88 34 L88 34 L78 44 L-78 44 Z"
          strokeOpacity="0.4"
        />
        {label(60)}
      </g>
    );
  }
  if (id === "phone") {
    return (
      <g>
        <Screen x={-28} y={-52} w={56} h={104} r={11} />
        {label(70)}
      </g>
    );
  }
  if (id === "tablet") {
    return (
      <g>
        <Screen x={-46} y={-60} w={92} h={120} r={10} />
        {label(78)}
      </g>
    );
  }
  return (
    <g>
      <rect
        style={{ fill: "var(--color-night-800)", stroke: "var(--color-bloom-400)" }}
        x="-66"
        y="-40"
        width="132"
        height="80"
        rx="10"

        strokeOpacity="0.55"
      />
      <circle
        style={{ fill: "none", stroke: "var(--color-brand-500)" }}
        cx="-30"
        cy="4"
        r="20"
        strokeWidth="7"
        strokeOpacity="0.6"
      />
      <path
        style={{ fill: "none", stroke: "var(--color-mint-400)" }}
        d="M-30 -16 A20 20 0 0 1 -11 9"
        strokeWidth="7"
      />
      {[0, 1, 2].map((index) => (
        <rect
          style={{ fill: "#ffffff" }}
          key={index}
          x="4"
          y={-18 + index * 16}
          width={48 - index * 12}
          height="7"
          rx="3.5"

          fillOpacity={0.3 - index * 0.06}
        />
      ))}
      {label(58)}
    </g>
  );
}

/**
 * The hero's visual: one organisation, transforming over six chapters. Purely
 * decorative (the story is told in the DOM copy beside it), so it is hidden from
 * assistive technology.
 */
export function StoryScene({ chapter, paused }: { chapter: number; paused: boolean }) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    card: `${uid}card`,
    tile: `${uid}tile`,
    plate: `${uid}plate`,
    edge: `${uid}edge`,
    halo: `${uid}halo`,
    core: `${uid}core`,
    gap: `${uid}gap`,
  };
  const cam = camera[chapter].s;
  const cx = VIEW.width / 2;
  const cy = VIEW.height / 2;
  const labels = sceneLabels;

  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className={`scene h-full w-full overflow-visible ${paused ? "is-paused" : ""}`}
      aria-hidden="true"
      focusable="false"
      ref={(node) => {
        if (!node) return;
        if (paused) node.pauseAnimations();
        else node.unpauseAnimations();
      }}
    >
      <defs>
        <linearGradient id={ids.card} x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--color-night-700)" }} offset="0" />
          <stop style={{ stopColor: "var(--color-night-900)" }} offset="1" />
        </linearGradient>
        <linearGradient id={ids.tile} x1="0" y1="0" x2="1" y2="1">
          <stop style={{ stopColor: "var(--color-bloom-500)" }} offset="0" />
          <stop style={{ stopColor: "var(--color-brand-600)" }} offset="1" />
        </linearGradient>
        <linearGradient id={ids.plate} x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: "var(--color-night-700)" }} offset="0" />
          <stop style={{ stopColor: "var(--color-night-900)" }} offset="1" />
        </linearGradient>
        <linearGradient id={ids.edge} x1="0" y1="0" x2="1" y2="0">
          <stop style={{ stopColor: "var(--color-brand-500)" }} offset="0" />
          <stop style={{ stopColor: "var(--color-bloom-400)" }} offset="0.5" />
          <stop style={{ stopColor: "var(--color-mint-400)" }} offset="1" />
        </linearGradient>
        <radialGradient id={ids.halo}>
          <stop style={{ stopColor: "var(--color-bloom-500)" }} offset="0" stopOpacity="0.45" />
          <stop style={{ stopColor: "var(--color-bloom-500)" }} offset="1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.core} cx="0.4" cy="0.35">
          <stop style={{ stopColor: "#ffffff" }} offset="0" />
          <stop style={{ stopColor: "var(--color-brand-100)" }} offset="0.3" />
          <stop style={{ stopColor: "var(--color-bloom-500)" }} offset="0.65" />
          <stop style={{ stopColor: "var(--color-brand-600)" }} offset="1" />
        </radialGradient>
      </defs>

      <g
        className="cam"
        style={{ transform: `translate(${cx * (1 - cam)}px, ${cy * (1 - cam)}px) scale(${cam})` }}
      >
        {plates.map((plate) => (
          <Actor key={plate.id} at={plate.track[chapter]}>
            <Plate
              size={plate.size}
              label={
                labels[plate.id === "cloud" ? "foundation" : plate.id === "data" ? "data" : "build"].layer
              }
              ids={ids}
            />
          </Actor>
        ))}

        {links.map((group, groupIndex) =>
          group.map((link, index) => (
            <LinkPath
              key={`${groupIndex}-${index}`}
              link={link}
              on={chapter === groupIndex}
              ids={ids}
              index={groupIndex * 20 + index}
            />
          )),
        )}

        <Actor at={analytics.dashboard[chapter]} bob={1}>
          <Dashboard ids={ids} />
        </Actor>
        <Actor at={analytics.forecast[chapter]} bob={3}>
          <Forecast ids={ids} />
        </Actor>

        {foundationParts.map((part, index) => (
          <Actor key={part.icon} at={part.track[chapter]}>
            <Pill label={labels.foundation.parts[index]} icon={part.icon} ids={ids} size={12} />
          </Actor>
        ))}

        {systems.map((system, index) => (
          <Actor key={system.id} at={system.track[chapter]} bob={index * 0.8}>
            <SystemCard
              label={labels.systems[system.id]}
              icon={system.icon}
              alert={system.alert}
              alertOn={chapter === 0}
              ids={ids}
            />
          </Actor>
        ))}

        {devices.map((device, index) => (
          <Actor key={device.id} at={device.track[chapter]} bob={index * 1.2}>
            <Device id={device.id} />
          </Actor>
        ))}

        <Actor at={apiPill[chapter]}>
          <Pill label={labels.build.api} icon="code" ids={ids} size={12} />
        </Actor>

        {aiChips.map((chip, index) => (
          <Actor key={chip.icon} at={chip.track[chapter]}>
            <Chip title={labels.ai[index].title} body={labels.ai[index].body} icon={chip.icon} />
          </Actor>
        ))}

        <Actor at={corePill[chapter]}>
          <Pill label={labels.transform.core} icon="building" ids={ids} strong size={13} />
        </Actor>

        {satellites.map((satellite, index) => (
          <Actor key={satellite.icon} at={satellite.track[chapter]} bob={index * 0.7}>
            <Pill label={labels.transform.satellites[index]} icon={satellite.icon} ids={ids} size={14} />
          </Actor>
        ))}

        <Actor at={orb[chapter]}>
          <Orb ids={ids} />
        </Actor>
      </g>
    </svg>
  );
}
