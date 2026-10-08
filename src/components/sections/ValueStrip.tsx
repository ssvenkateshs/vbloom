import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { valueStrip } from "@/content/site";

/** Four compact positioning lines directly under the hero, for the quick reader. */
export function ValueStrip() {
  return (
    <div className="relative z-10 mx-auto -mt-6 max-w-7xl px-5 sm:-mt-10 sm:px-8">
      <Reveal className="bg-line shadow-soft grid gap-px overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-4">
        {valueStrip.map((item) => (
          <div key={item.title} className="flex items-start gap-4 bg-white p-6">
            <span className="bg-brand-50 text-brand-500 grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
              <Icon name={item.icon} className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="font-display text-ink text-base font-bold">{item.title}</p>
              <p className="text-ink-muted mt-1 text-sm">{item.body}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
