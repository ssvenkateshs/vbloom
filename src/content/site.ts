/**
 * Single source of truth for every piece of copy on the site.
 * Edit this file to change the website's content; the components read from it.
 */

export const company = {
  name: "VBloom",
  legalName: "VBloom Technologies",
  tagline: "Bloom beyond technology",
  description:
    "VBloom is an AI and digital transformation company. We connect your systems, put AI to work on your data, and engineer the cloud, applications and managed services that keep it all running.",
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
  { label: "Industries", href: "#industries" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  eyebrow: "VBloom AI · Digital Transformation · Enterprise Solutions",
  titleLead: "Bloom beyond",
  titleAccent: "technology.",
  subhead:
    "Your enterprise, reimagined with AI. Scroll to leave the old way of working behind and see what your business becomes when everything connects.",
  primaryCta: { label: "Start your transformation", href: "#contact" },
  secondaryCta: { label: "Begin the journey" },
  scrollHint: "Scroll to leave Earth",
  robotHint: "Move your cursor. It is watching.",
} as const;

export type JourneyStep = {
  id: string;
  step: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: readonly string[];
  accent: string;
  cta?: { primary: { label: string; href: string }; secondary: { label: string; href: string } };
};

/** The six scenes of the scroll journey, in order (see the 3D scenes in src/world/scenes). */
export const journey: readonly JourneyStep[] = [
  {
    id: "challenge",
    step: "01",
    label: "Challenge",
    eyebrow: "The problem",
    title: "Every business is drowning in complexity",
    body: "Emails everywhere, spreadsheets, silos and stalled approvals. Teams are overwhelmed, data is trapped and decisions wait.",
    tags: ["Manual processes", "Disconnected systems", "Delayed decisions"],
    accent: "#ff4d6d",
  },
  {
    id: "connect",
    step: "02",
    label: "Connect",
    eyebrow: "The turning point",
    title: "What if everything worked together?",
    body: "ERP, CRM, finance, projects and documents stop living on separate planets, and data starts to flow between them.",
    tags: ["ERP ⇄ CRM", "Documents ⇄ Mobile", "One source of truth"],
    accent: "#4cc9ff",
  },
  {
    id: "transform",
    step: "03",
    label: "Transform",
    eyebrow: "The intelligence layer",
    title: "From information to intelligence",
    body: "An AI core learns from your documents, transactions, workflows, emails and images. One brain for the whole business.",
    tags: ["Enterprise AI", "Data platforms", "Copilots"],
    accent: "#8b7cff",
  },
  {
    id: "automate",
    step: "04",
    label: "Automate",
    eyebrow: "AI in action",
    title: "Intelligence that creates outcomes",
    body: "AI agents generate the reports, detect the risks, predict the delays and route the approvals before anyone has to ask.",
    tags: ["Auto-reporting", "Risk detection", "Approval automation"],
    accent: "#a597ff",
  },
  {
    id: "scale",
    step: "05",
    label: "Scale",
    eyebrow: "Every industry",
    title: "The future is already here",
    body: "Construction, manufacturing, healthcare and finance, running on digital twins, predictive analytics and autonomous workflows.",
    tags: ["Digital twins", "Predictive analytics", "Autonomous workflows"],
    accent: "#c06bff",
  },
  {
    id: "bloom",
    step: "06",
    label: "Bloom",
    eyebrow: "Welcome to VBloom",
    title: "From complexity to clarity",
    body: "From technology to transformation. From data to intelligence. This is what a fully bloomed enterprise looks like.",
    tags: ["AI", "Data", "Cloud", "Automation", "Applications", "Analytics"],
    accent: "#33bf92",
    cta: {
      primary: { label: "Let's build the future together", href: "#contact" },
      secondary: { label: "Explore services", href: "#services" },
    },
  },
];

export const services = {
  eyebrow: "What we do",
  title: "AI-led services, engineered end to end",
  intro:
    "AI changes the outcome. Cloud, applications and managed services make it last. We bring both, under one accountable team.",
  items: [
    {
      id: "ai",
      title: "AI & Intelligent Automation",
      summary: "AI agents, enterprise copilots and document intelligence that take repetitive work off your teams.",
      points: ["AI agents & copilots", "Document intelligence", "Process automation"],
      icon: "spark",
    },
    {
      id: "data",
      title: "Data & Analytics",
      summary: "Data platforms, live dashboards and predictive models built on data you can trust.",
      points: ["Data platforms", "BI & dashboards", "Predictive analytics"],
      icon: "chart",
    },
    {
      id: "enterprise",
      title: "Enterprise Applications",
      summary: "ERP, CRM and line-of-business systems connected into one flow of information.",
      points: ["ERP & CRM", "Systems integration", "Workflow platforms"],
      icon: "nodes",
    },
    {
      id: "cloud",
      title: "Cloud & Infrastructure",
      summary: "Migration, modernisation and DevOps across AWS, Azure and GCP, with security designed in.",
      points: ["Cloud migration", "Kubernetes & DevOps", "Cost optimisation"],
      icon: "cloud",
    },
    {
      id: "apps",
      title: "Application Development",
      summary: "Web, mobile and API products with automated testing and delivery as standard practice.",
      points: ["Web & mobile apps", "APIs & integrations", "Legacy modernisation"],
      icon: "code",
    },
    {
      id: "managed",
      title: "Managed Services",
      summary: "Monitoring, support and continuous improvement for the systems that run your business.",
      points: ["Monitoring & SRE", "Application support", "Continuous improvement"],
      icon: "shield",
    },
  ],
} as const;

export const product = {
  eyebrow: "Our AI product",
  // TODO: confirm the product's name and description. Both come from the design brief.
  name: "VBloom AI Engine",
  summary:
    "One intelligence layer for the whole enterprise. It connects to your ERP, CRM, documents, emails, field operations, teams and mobile apps, and turns the information flowing through them into decisions.",
  capabilities: ["Documents", "Transactions", "Workflows", "Emails", "Images", "Field operations"],
  cta: { label: "Request a demo", href: "#contact" },
} as const;

export const scenarios = {
  eyebrow: "Industries",
  title: "Stories, not service lists",
  intro:
    "Illustrative scenarios: the same everyday problems, played out without an intelligence layer and with one.",
  items: [
    {
      industry: "Construction",
      title: "Project delays",
      without: ["Delayed reporting", "Budget overruns", "No visibility across sites"],
      with: ["Real-time project intelligence", "Automated reporting", "Predictive delay warnings"],
    },
    {
      industry: "Customer service",
      title: "1,000 support emails",
      without: ["Queues pile up", "Slow, inconsistent replies", "Agents buried in triage"],
      with: ["An AI agent reads and routes every request", "Routine answers handled automatically", "People focus on the hard cases"],
    },
    {
      industry: "Finance",
      title: "Invoices piling up",
      without: ["Manual data entry", "Approvals stuck in inboxes", "Month-end surprises"],
      with: ["AI extracts invoice data", "Approvals automated by policy", "Live insight into spend"],
    },
  ],
  industries: ["Construction", "Manufacturing", "Healthcare", "Finance", "Retail", "Logistics"],
} as const;

export const impact = {
  eyebrow: "Real impact",
  title: "Every engagement follows the same arc",
  steps: [
    { label: "Manual process", body: "Where the time and the errors are today." },
    { label: "Automated workflow", body: "The repetitive work, handled by software." },
    { label: "AI insight", body: "Patterns and risks surfaced as they happen." },
    { label: "Business outcome", body: "Faster decisions, lower cost, room to grow." },
  ],
} as const;

export const innovationLab = {
  eyebrow: "Innovation lab",
  title: "Almost like entering the future",
  intro: "The technologies we put to work. Move your cursor over a card.",
  items: [
    { title: "AI Agents", body: "Software that plans, decides and acts across your systems.", icon: "spark" },
    { title: "Autonomous Workflows", body: "Processes that run themselves and escalate only the exceptions.", icon: "nodes" },
    { title: "Digital Twins", body: "Live virtual models of sites, plants and assets you can test against.", icon: "cube" },
    { title: "Computer Vision", body: "Cameras that inspect, count and flag issues in real time.", icon: "eye" },
    { title: "Enterprise Copilots", body: "Assistants that know your documents, data and processes.", icon: "chat" },
    { title: "Predictive Analytics", body: "Forecasts that warn you early about delays, demand and risk.", icon: "chart" },
  ],
} as const;

export const pillars = {
  eyebrow: "Why VBloom",
  title: "We don't implement technology. We engineer business evolution.",
  intro: "A transformation partner, not a vendor.",
  items: [
    { name: "Imagine", subtitle: "Innovation & strategy", body: "We start with the business problem and design where AI can change the outcome." },
    { name: "Transform", subtitle: "Technology & automation", body: "We connect your systems, build the intelligence layer and automate the work." },
    { name: "Bloom", subtitle: "Growth & continuous improvement", body: "We stay to measure, tune and grow what we build together." },
  ],
  about:
    "VBloom is a newly founded company. That means direct access to the people who build your solution, flexible ways of working, and a partner invested in making your first project one you are proud to talk about.",
} as const;

export const finalCta = {
  title: "Ready to bloom beyond technology?",
  subhead:
    "Transform your business with AI, digital innovation, enterprise applications, data intelligence and automation.",
  cta: { label: "Start your transformation", href: "#contact" },
} as const;

export const contact = {
  title: "Start your transformation",
  intro:
    "Tell us where the complexity is today. We will come back within one business day with honest thoughts on where AI can help, and where it can't.",
  // Set NEXT_PUBLIC_CONTACT_ENDPOINT to a form backend (Formspree, Basin, your own API)
  // to receive submissions. Without it the form falls back to opening the visitor's email client.
  services: [
    "AI & Intelligent Automation",
    "Data & Analytics",
    "Enterprise Applications",
    "Cloud & Infrastructure",
    "Application Development",
    "Managed Services",
    "VBloom AI Engine demo",
    "Something else",
  ],
} as const;
