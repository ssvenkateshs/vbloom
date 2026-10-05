"use client";

import { useEffect, useState } from "react";
import { company, navLinks } from "@/content/site";
import { Logo } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-card-border bg-page/85 border-b backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${company.name} home`}>
          <Logo className="h-9 w-9 shrink-0" />
          <span className="font-display text-xl font-semibold tracking-tight">{company.name}</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-text-muted hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-300 rounded-full px-3.5 py-2 text-sm font-medium transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <a
            href="#contact"
            className="bg-brand-600 hover:bg-brand-700 hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition sm:inline-block"
          >
            Get in touch
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="border-card-border text-text-muted hover:border-brand-400 grid h-10 w-10 place-items-center rounded-full border transition lg:hidden"
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
                <path
                  d="M4 7.5h16M4 12h16M4 16.5h16"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-card-border bg-page border-t px-5 pt-2 pb-6 lg:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-card-border/70 text-text block border-b py-3.5 text-base font-medium last:border-0"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="bg-brand-600 mt-4 block rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Get in touch
          </a>
        </nav>
      )}
    </header>
  );
}
