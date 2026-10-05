"use client";

import { useRef } from "react";
import { innovationLab } from "@/content/site";
import { Icon, type IconName } from "../Icons";
import { Reveal } from "../Reveal";
import { Section } from "../Section";

/** Doc section 7: floating cards that react to the cursor (3D tilt + moving glare). */
function TiltCard({ title, body, icon }: { title: string; body: string; icon: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="[perspective:900px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group from-space-700 to-space-900 relative h-full [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-7 transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:transform-none"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(22rem circle at var(--gx,50%) var(--gy,50%), rgb(139 124 255 / 0.22), transparent 55%)",
          }}
        />
        <span className="bg-brand-500/15 text-brand-200 relative grid h-12 w-12 [transform:translateZ(30px)] place-items-center rounded-2xl">
          <Icon name={icon as IconName} />
        </span>
        <h3 className="font-display relative mt-6 [transform:translateZ(24px)] text-xl font-semibold text-white">
          {title}
        </h3>
        <p className="text-text-muted relative mt-2.5 [transform:translateZ(16px)] text-sm leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}

export function InnovationLab() {
  return (
    <Section
      eyebrow={innovationLab.eyebrow}
      title={innovationLab.title}
      intro={innovationLab.intro}
      className="bg-space-950/60"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {innovationLab.items.map((item, index) => (
          <Reveal key={item.title} delay={index * 70} className="h-full">
            <TiltCard {...item} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
