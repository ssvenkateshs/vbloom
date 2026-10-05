import { company, navLinks, services } from "@/content/site";
import { Logo } from "./Icons";

export function Footer() {
  return (
    <footer className="border-card-border bg-page-alt border-t">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#top" className="flex items-center gap-2.5">
              <Logo className="h-9 w-9" />
              <span className="font-display text-xl font-semibold tracking-tight">{company.name}</span>
            </a>
            <p className="text-text-muted mt-4 max-w-sm text-sm leading-relaxed">{company.description}</p>
            <div className="mt-5 flex gap-3">
              <a
                href={company.social.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${company.name} on LinkedIn`}
                className="border-card-border text-text-muted hover:border-brand-400 hover:text-brand-600 grid h-10 w-10 place-items-center rounded-full border transition"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.8v1.5h.05a4.2 4.2 0 0 1 3.75-2c2.9 0 4.4 1.85 4.4 5.3v6.2h-4v-5.5c0-1.4-.5-2.35-1.75-2.35-1.05 0-1.7.7-1.95 1.4-.1.25-.15.6-.15.95v5.5h-4v-11Z" />
                </svg>
              </a>
              <a
                href={company.social.github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${company.name} on GitHub`}
                className="border-card-border text-text-muted hover:border-brand-400 hover:text-brand-600 grid h-10 w-10 place-items-center rounded-full border transition"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label="Footer sections">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-text-muted hover:text-brand-600 dark:hover:text-brand-300 text-sm transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer services">
            <h3 className="text-sm font-semibold">Services</h3>
            <ul className="mt-4 space-y-2.5">
              {services.items.map((service) => (
                <li key={service.id}>
                  <a
                    href="#services"
                    className="text-text-muted hover:text-brand-600 dark:hover:text-brand-300 text-sm transition"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-card-border text-text-faint mt-12 flex flex-col gap-3 border-t pt-7 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}. All rights reserved.
          </p>
          <p>{company.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
