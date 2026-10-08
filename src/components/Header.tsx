"use client";

import { useEffect, useState } from "react";
import { company, headerCta, navLinks } from "@/content/site";
import { Logo } from "./Icons";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="bg-night-950/85 fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${company.name} home`}>
          <Logo className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight text-white">{company.name}</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-on-dark-muted rounded-full px-4 py-2 text-sm font-medium transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={headerCta.href}
            className="border-brand-400/50 hover:border-brand-300 hover:bg-brand-500/15 hidden rounded-full border px-5 py-2 text-sm font-semibold text-white transition sm:inline-flex"
          >
            {headerCta.label}
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/5 lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M6.5 6.5l11 11M17.5 6.5l-11 11"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-white/[0.07] px-5 pt-2 pb-6 lg:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-3.5 text-base font-medium text-white hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <a
            href={headerCta.href}
            onClick={() => setMenuOpen(false)}
            className="bg-brand-500 mt-3 block rounded-full px-5 py-3.5 text-center text-sm font-semibold text-white"
          >
            {headerCta.label}
          </a>
        </nav>
      )}
    </header>
  );
}
