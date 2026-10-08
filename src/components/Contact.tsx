"use client";

import { useState } from "react";
import { company, contact } from "@/content/site";
import { ArrowRight } from "./Icons";
import { Reveal } from "./Reveal";

type Status = "idle" | "sending" | "sent" | "error";

const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink transition placeholder:text-ink-faint focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // With no form backend configured, hand off to the visitor's mail client
    // so the form is still useful on a freshly deployed site.
    if (!endpoint) {
      const body = [
        `Name: ${data.get("name")}`,
        `Company: ${data.get("company") || "—"}`,
        `Email: ${data.get("email")}`,
        `Service: ${data.get("service")}`,
        "",
        String(data.get("message") ?? ""),
      ].join("\n");
      const subject = `Enquiry from ${data.get("name")}`;
      window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setError(undefined);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      form.reset();
      setStatus("sent");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="text-brand-500 flex items-center gap-3 text-sm font-semibold">
              <span className="bg-brand-300 h-px w-8" />
              {contact.eyebrow}
            </p>
            <h2 className="font-display text-ink mt-4 text-3xl font-extrabold tracking-tight sm:text-[2.8rem]">
              {contact.title}
            </h2>
            <p className="text-ink-muted mt-5 text-lg leading-relaxed">{contact.intro}</p>

            <dl className="mt-10 space-y-5 text-sm">
              <div>
                <dt className="text-ink-faint font-semibold">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${company.email}`} className="text-brand-500 font-medium hover:underline">
                    {company.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint font-semibold">Phone</dt>
                <dd className="text-ink mt-1 font-medium">{company.phone}</dd>
              </div>
              <div>
                <dt className="text-ink-faint font-semibold">Location</dt>
                <dd className="text-ink mt-1 font-medium">{company.location}</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={120}>
            <form
              onSubmit={handleSubmit}
              className="card-wash border-line shadow-lift rounded-[2rem] border p-6 sm:p-9"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-ink-muted block text-sm font-medium">
                    Name <span className="text-brand-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className={`mt-2 ${fieldClass}`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="text-ink-muted block text-sm font-medium">
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    className={`mt-2 ${fieldClass}`}
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="text-ink-muted block text-sm font-medium">
                    Work email <span className="text-brand-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={`mt-2 ${fieldClass}`}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="text-ink-muted block text-sm font-medium">
                    What do you need help with?
                  </label>
                  <select
                    id="service"
                    name="service"
                    defaultValue={contact.services[0]}
                    className={`mt-2 ${fieldClass}`}
                  >
                    {contact.services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="text-ink-muted block text-sm font-medium">
                  Project details <span className="text-brand-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className={`mt-2 resize-y ${fieldClass}`}
                  placeholder="A few lines on what you are trying to achieve, any deadlines, and the systems involved."
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="group bg-brand-500 hover:bg-brand-600 mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send enquiry"}
                {status !== "sending" && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>

              <p aria-live="polite" className="mt-4 min-h-5 text-center text-sm">
                {status === "sent" && (
                  <span className="text-mint-600 font-medium">
                    {endpoint
                      ? "Thank you — we will reply within one business day."
                      : "Your email client should now be open with the enquiry ready to send."}
                  </span>
                )}
                {status === "error" && (
                  <span className="font-medium text-red-600">
                    We could not send that ({error}). Please email {company.email} directly.
                  </span>
                )}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
