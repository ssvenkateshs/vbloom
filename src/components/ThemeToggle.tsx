"use client";

/**
 * Flips the `dark` class on <html> and remembers the choice. The icon is
 * selected in CSS from that same class, so the button holds no React state
 * and cannot disagree with the rendered theme after hydration.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextIsDark);
    try {
      localStorage.setItem("vbloom-theme", nextIsDark ? "dark" : "light");
    } catch {
      // Private browsing can block storage; the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className="border-card-border text-text-muted hover:border-brand-400 hover:text-brand-500 grid h-10 w-10 place-items-center rounded-full border transition"
    >
      {/* Moon shown in light mode, sun in dark mode. */}
      <svg className="h-5 w-5 dark:hidden" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="hidden h-5 w-5 dark:block" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 3.6v1.9M12 18.5v1.9M3.6 12h1.9M18.5 12h1.9M6.1 6.1l1.3 1.3M16.6 16.6l1.3 1.3M17.9 6.1l-1.3 1.3M7.4 16.6l-1.3 1.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
