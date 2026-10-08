"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { themes, type ThemeId } from "@/content/site";

import { themeStorageKey as storageKey } from "./themeBoot";

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function readTheme(): ThemeId {
  const current = document.documentElement.dataset.theme;
  return (themes.options.find((option) => option.id === current)?.id ?? "violet") as ThemeId;
}

/** A floating picker for previewing the colour themes. Remove it once a theme is chosen. */
export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "violet" as ThemeId);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = themes.options.find((option) => option.id === theme)!;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === "Escape"
          : !panelRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const choose = (id: ThemeId) => {
    const root = document.documentElement;
    if (id === "violet") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", id);
    try {
      localStorage.setItem(storageKey, id);
    } catch {}
  };

  return (
    <div ref={panelRef} className="fixed right-4 bottom-4 z-[70] sm:right-6 sm:bottom-6">
      {open && (
        <div
          id="theme-panel"
          role="radiogroup"
          aria-label={themes.hint}
          className="bg-night-900/95 text-on-dark mb-3 w-72 rounded-3xl border border-white/10 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <p className="text-on-dark-faint px-3 pt-2 pb-1 text-xs font-semibold tracking-wide">
            {themes.hint}
          </p>
          {themes.options.map((option) => {
            const selected = option.id === active.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(option.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                  selected ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="flex shrink-0 -space-x-1.5">
                  {option.colors.map((color) => (
                    <span
                      key={color}
                      className="ring-night-900 h-5 w-5 rounded-full ring-2"
                      style={{ background: color }}
                    />
                  ))}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{option.name}</span>
                  <span className="text-on-dark-muted block text-xs">{option.note}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="theme-panel"
        className="bg-night-900/95 ml-auto flex items-center gap-2.5 rounded-full border border-white/15 py-2 pr-4 pl-2 text-sm font-semibold text-white shadow-xl shadow-black/30 backdrop-blur-xl transition hover:border-white/30"
      >
        <span className="flex -space-x-1.5">
          {active.colors.slice(1).map((color) => (
            <span
              key={color}
              className="ring-night-900 h-5 w-5 rounded-full ring-2"
              style={{ background: color }}
            />
          ))}
        </span>
        {themes.label}
        <span className="text-on-dark-muted">· {active.name}</span>
      </button>
    </div>
  );
}
