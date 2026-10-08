import { Logo } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { about, company } from "@/content/site";

/** Six disciplines on one ring, all wired to the same centre: they work together. */
function Convergence() {
  const radius = 150;
  const nodes = about.disciplines.map((label, index) => {
    const angle = (index / about.disciplines.length) * Math.PI * 2 - Math.PI / 2;
    return { label, x: 200 + Math.cos(angle) * radius, y: 200 + Math.sin(angle) * radius };
  });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="about-glow">
            <stop style={{ stopColor: "var(--color-bloom-500)" }} offset="0" stopOpacity="0.45" />
            <stop style={{ stopColor: "var(--color-bloom-500)" }} offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle style={{ fill: "url(#about-glow)" }} cx="200" cy="200" r="190" />
        <circle
          style={{ fill: "none", stroke: "var(--color-bloom-400)" }}
          cx="200"
          cy="200"
          r={radius}

          strokeOpacity="0.25"
          strokeDasharray="3 7"
        />
        {nodes.map((node) => (
          <line
            style={{ stroke: "var(--color-mint-400)" }}
            key={node.label}
            x1="200"
            y1="200"
            x2={node.x}
            y2={node.y}

            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
        ))}
        <circle
          style={{ fill: "var(--color-night-800)", stroke: "var(--color-bloom-400)" }}
          cx="200"
          cy="200"
          r="46"
          strokeOpacity="0.5"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Logo className="h-12 w-12" />
      </div>
      <ul>
        {nodes.map((node) => (
          <li
            key={node.label}
            className="bg-night-800/90 absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-lg shadow-black/30 sm:text-sm"
            style={{ left: `${(node.x / 400) * 100}%`, top: `${(node.y / 400) * 100}%` }}
          >
            {node.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="night-glow text-on-dark relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-bloom-300 flex items-center gap-3 text-sm font-semibold">
            <span className="bg-bloom-400/60 h-px w-8" />
            {about.eyebrow}
          </p>
          <p className="font-display mt-6 text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
            {company.name}
          </p>
          <p className="font-display text-gradient-light mt-3 text-xl font-bold sm:text-2xl">
            {company.tagline}
          </p>
          <h2 className="font-display mt-10 text-2xl leading-snug font-bold text-white sm:text-3xl">
            {about.positioning}
          </h2>
          <p className="text-on-dark-muted mt-5 max-w-xl text-lg leading-relaxed">{about.body}</p>
          <p className="border-mint-400/30 bg-mint-400/10 text-mint-300 mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold">
            {about.closing}
          </p>
        </Reveal>
        <Reveal delay={150}>
          <Convergence />
        </Reveal>
      </div>
    </section>
  );
}
