import { company, navLinks, services } from "@/content/site";
import { Logo } from "./Icons";

export function Footer() {
  return (
    <footer className="bg-night-950 text-on-dark">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#top" className="flex items-center gap-2.5">
              <Logo className="h-9 w-9" />
              <span className="font-display text-xl font-bold text-white">{company.name}</span>
            </a>
            <p className="text-gradient-light mt-2 text-sm font-semibold">{company.tagline}</p>
            <p className="text-on-dark-muted mt-4 max-w-sm text-sm leading-relaxed">{company.description}</p>
            <a
              href={company.social.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${company.name} on LinkedIn`}
              className="text-on-dark-muted hover:border-brand-400 mt-5 grid h-10 w-10 place-items-center rounded-full border border-white/10 transition hover:text-white"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.8v1.5h.05a4.2 4.2 0 0 1 3.75-2c2.9 0 4.4 1.85 4.4 5.3v6.2h-4v-5.5c0-1.4-.5-2.35-1.75-2.35-1.05 0-1.7.7-1.95 1.4-.1.25-.15.6-.15.95v5.5h-4v-11Z" />
              </svg>
            </a>
          </div>

          <nav aria-label="Footer sections">
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-on-dark-muted text-sm transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" className="text-on-dark-muted text-sm transition hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer services">
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2.5">
              {services.items.map((service) => (
                <li key={service.title}>
                  <a href="#services" className="text-on-dark-muted text-sm transition hover:text-white">
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="text-on-dark-faint mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}. All rights reserved.
          </p>
          <p>{company.location}</p>
        </div>
      </div>
    </footer>
  );
}
