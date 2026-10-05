/**
 * Single source of truth for every piece of copy on the site.
 * Edit this file to change the website's content — the components read from it.
 */

export const company = {
  name: "VBloom",
  legalName: "VBloom Technologies",
  tagline: "Technology that helps your business bloom",
  description:
    "VBloom is an IT consulting and technology services firm. We help organisations modernise their platforms, build software that lasts, and get measurable value from cloud, data and AI.",
  // TODO: replace the placeholders below with your registered details.
  email: "hello@vbloom.com",
  phone: "+91 00000 00000",
  location: "Bengaluru, India",
  social: {
    linkedin: "https://www.linkedin.com/company/vbloom",
    github: "https://github.com/ssvenkateshs/vbloom",
  },
} as const;

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Approach", href: "#approach" },
  { label: "Why VBloom", href: "#why" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  eyebrow: "IT consulting & technology services",
  headlineLead: "Engineering the platforms your",
  headlineAccent: "business grows on",
  subhead:
    "From cloud modernisation to custom software, data platforms and managed support — VBloom gives you a senior team that plans carefully, ships steadily, and stays accountable for the outcome.",
  primaryCta: { label: "Start a conversation", href: "#contact" },
  secondaryCta: { label: "Explore our services", href: "#services" },
  highlights: ["Senior-led delivery teams", "Cloud, data & AI expertise", "Fixed-scope or dedicated squads"],
} as const;

export const services = [
  {
    id: "cloud",
    title: "Cloud & Infrastructure",
    summary:
      "Migration, modernisation and cost optimisation across AWS, Azure and GCP — with infrastructure as code and security built in from day one.",
    points: ["Cloud migration & landing zones", "Kubernetes & containers", "Cost and performance tuning"],
    icon: "cloud",
  },
  {
    id: "software",
    title: "Application Development",
    summary:
      "Custom web, mobile and API products built by small senior teams, with automated testing and continuous delivery as standard practice.",
    points: ["Web & mobile applications", "API and integration platforms", "Legacy application rebuilds"],
    icon: "code",
  },
  {
    id: "data",
    title: "Data & AI",
    summary:
      "Data platforms, analytics and pragmatic AI — pipelines you can trust, dashboards people actually use, and models deployed responsibly.",
    points: ["Data warehouse & lakehouse", "BI and reporting", "LLM and ML integration"],
    icon: "spark",
  },
  {
    id: "advisory",
    title: "Technology Advisory",
    summary:
      "Independent assessments, architecture reviews and transformation roadmaps that give leadership a clear, costed path forward.",
    points: ["Architecture & code audits", "Transformation roadmaps", "Vendor and tooling selection"],
    icon: "compass",
  },
  {
    id: "managed",
    title: "Managed Services",
    summary:
      "Ongoing support, monitoring and incremental improvement of the systems that run your business, under clearly defined service levels.",
    points: ["Application support", "DevOps & SRE as a service", "Release and patch management"],
    icon: "shield",
  },
  {
    id: "talent",
    title: "Talent Solutions",
    summary:
      "Vetted engineers, analysts and architects embedded directly into your teams when you need to scale capacity without the hiring lag.",
    points: ["Dedicated engineering squads", "Contract-to-hire", "Specialist skill augmentation"],
    icon: "people",
  },
] as const;

export const approach = {
  title: "A delivery approach built on clarity",
  intro:
    "Most technology programmes fail on communication long before they fail on code. Our process is deliberately simple and visible at every step.",
  steps: [
    {
      number: "01",
      title: "Discover",
      body: "We start with your business goal, not a technology shortlist. Workshops, system reviews and a written summary of what we heard.",
    },
    {
      number: "02",
      title: "Design",
      body: "A costed plan: architecture, scope, milestones, risks and the team who will do the work. No surprises after signature.",
    },
    {
      number: "03",
      title: "Deliver",
      body: "Short iterations with working software at the end of each one. Demos you attend, metrics you can see, decisions logged.",
    },
    {
      number: "04",
      title: "Grow",
      body: "Documentation, handover and training — then ongoing support or the next increment, whichever serves you better.",
    },
  ],
} as const;

export const differentiators = {
  title: "Why teams choose VBloom",
  intro: "We are a focused, senior team. That shapes everything about how we work with you.",
  items: [
    {
      title: "Senior people on the actual work",
      body: "The engineers and architects you meet during scoping are the ones who build it. No handover to a junior bench after the contract is signed.",
    },
    {
      title: "Transparent, fixed commitments",
      body: "Clear scope, clear price, clear timeline. Where scope genuinely has to change, you see the impact and approve it before we proceed.",
    },
    {
      title: "Vendor-neutral advice",
      body: "We hold no reseller quotas. Our recommendation is whatever is demonstrably right for your constraints, budget and team.",
    },
    {
      title: "Built to be handed over",
      body: "Documented, tested, standards-based code with no lock-in to us. Your team can take full ownership whenever you choose.",
    },
    {
      title: "Security and compliance by default",
      body: "Least-privilege access, secrets management, dependency scanning and audit trails are part of the baseline, not a paid extra.",
    },
    {
      title: "Responsive by design",
      body: "A small team means short escalation paths. You speak to a decision-maker, usually within the same working day.",
    },
  ],
} as const;

export const industries = [
  "Financial services",
  "Healthcare",
  "Retail & e-commerce",
  "Manufacturing",
  "Logistics",
  "SaaS & technology",
  "Education",
  "Public sector",
] as const;

export const about = {
  title: "About VBloom",
  paragraphs: [
    "VBloom is a newly founded IT consulting and technology services company. We were started by practitioners who spent years inside large delivery organisations and wanted to offer something simpler: a senior team, honest estimates, and software that holds up after the launch.",
    "We are deliberately small. Every engagement is staffed by people with real production experience in the technology involved, and the person who scopes your work stays accountable for delivering it.",
    "Being new means we work hard for every client. It also means you get direct access to the founders, flexibility on engagement models, and a partner genuinely invested in making your first project a reference you are happy to give.",
  ],
  engagementModels: [
    { title: "Project delivery", body: "Fixed scope and price for a defined outcome." },
    { title: "Dedicated squad", body: "A monthly team that works as part of yours." },
    { title: "Advisory retainer", body: "Architecture and strategy support on call." },
  ],
} as const;

export const contact = {
  title: "Let's talk about your project",
  intro:
    "Tell us what you are trying to achieve and we will come back within one business day with honest thoughts — whether or not we are the right fit.",
  // Set NEXT_PUBLIC_CONTACT_ENDPOINT to a form backend (Formspree, Basin, your own API)
  // to receive submissions. Without it the form falls back to opening the visitor's email client.
  services: [
    "Cloud & Infrastructure",
    "Application Development",
    "Data & AI",
    "Technology Advisory",
    "Managed Services",
    "Talent Solutions",
    "Something else",
  ],
} as const;
