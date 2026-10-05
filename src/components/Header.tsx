"use client";

import { useEffect, useState } from "react";
import { company, navLinks } from "@/content/site";
import { ArrowRight, Logo } from "./Icons";

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
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pt-4 sm:px-8">
        <a
          href="#experience"
          className="glass flex items-center gap-2.5 rounded-full py-1.5 pr-5 pl-1.5"
          aria-label={`${company.name} home`}
        >
          <Logo className="h-8 w-8 shrink-0" />
          <span className="font-tech text-sm font-semibold tracking-[0.22em] text-white">VBLOOM</span>
        </a>

        <nav aria-label="Main" className="glass hidden items-center gap-1 rounded-full p-1.5 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition hover:bg-white/8 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="group hidden items-center gap-2.5 rounded-full bg-white py-1.5 pr-1.5 pl-5 text-sm font-semibold text-space-950 transition hover:bg-brand-200 sm:inline-flex"
          >
            Start your transformation
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="glass grid h-11 w-11 place-items-center rounded-full text-white lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="glass mx-4 mt-3 rounded-3xl p-3 lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-2xl px-4 py-3.5 text-base font-medium text-white hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-full bg-white px-5 py-3.5 text-center text-sm font-semibold text-space-950"
          >
            Start your transformation
          </a>
        </nav>
      )}
    </header>
  );
}
