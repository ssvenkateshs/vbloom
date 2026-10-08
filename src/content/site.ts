/**
 * Single source of truth for every piece of copy on the site.
 * Edit this file to change the website's content; the components read from it.
 */

export const company = {
  name: "VBloom",
  legalName: "VBloom Technologies",
  tagline: "Where AI, Technology & Innovation Bloom",
  description:
    "VBloom is a technology services and digital transformation company. We bring together AI, data, cloud, digital engineering and enterprise platforms to help organisations transform.",
  // TODO: replace the placeholders below with your registered details.
  email: "hello@vbloom.com",
  phone: "+91 00000 00000",
  location: "Bengaluru, India",
  social: {
    linkedin: "https://www.linkedin.com/company/vbloom",
  },
} as const;

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "AI", href: "#ai" },
  { label: "Industries", href: "#industries" },
  { label: "Insights", href: "#insights" },
  { label: "About", href: "#about" },
] as const;

export const headerCta = { label: "Talk to Us", href: "#contact" } as const;

export type ChapterId = "understand" | "think" | "know" | "scale" | "build" | "transform";

export type Chapter = {
  id: ChapterId;
  step: string;
  label: string;
  title: string;
  body: string;
};

/** The six chapters of the 30-second hero story, in order (see components/hero/scene.ts). */
export const story = {
  /** Seconds each chapter stays on screen while the story plays. */
  chapterSeconds: 5,
  controls: { pause: "Pause the story", play: "Play the story", chapter: "Show chapter" },
  chapters: [
    {
      id: "understand",
      step: "01",
      label: "Understand",
      title: "Complexity is slowing business down.",
      body: "Disconnected systems, fragmented data and manual work make it harder to move with speed and confidence.",
    },
    {
      id: "think",
      step: "02",
      label: "Think",
      title: "Put intelligence into everyday work.",
      body: "AI should not exist separately from the business. AI should become part of everyday work.",
    },
    {
      id: "know",
      step: "03",
      label: "Know",
      title: "Turn information into decisions.",
      body: "VBloom helps organisations convert fragmented information into trusted business intelligence.",
    },
    {
      id: "scale",
      step: "04",
      label: "Scale",
      title: "Build a foundation ready to scale.",
      body: "AI cannot transform an organisation if the underlying technology foundation cannot support it.",
    },
    {
      id: "build",
      step: "05",
      label: "Build",
      title: "Create experiences that move business forward.",
      body: "VBloom doesn't just advise. VBloom builds.",
    },
    {
      id: "transform",
      step: "06",
      label: "Transform",
      title: "Technology that helps your business bloom.",
      body: "AI, data, cloud, applications and automation, working as one connected enterprise.",
    },
  ] as const satisfies readonly Chapter[],
  finale: {
    primary: { label: "Explore Services", href: "#services" },
    secondary: { label: "Talk to Our Team", href: "#contact" },
  },
} as const;

/** Labels drawn inside the hero scene. They follow the brief's storyboard. */
export const sceneLabels = {
  systems: {
    finance: "Finance",
    operations: "Operations",
    crm: "CRM",
    projects: "Projects",
    documents: "Documents",
    data: "Data",
    iot: "IoT",
  },
  ai: [
    { title: "AI Assistant", body: "Ask enterprise knowledge" },
    { title: "AI Agent", body: "Perform actions automatically" },
    { title: "Document AI", body: "Read contracts and invoices" },
    { title: "Intelligent Automation", body: "Automate business processes" },
  ],
  data: { layer: "DATA", analytics: "Analytics", insight: "Insight", forecast: "Forecast" },
  foundation: {
    layer: "CLOUD",
    parts: ["Applications", "Security", "Networks", "Platforms", "Infrastructure"],
  },
  build: {
    layer: "APPS",
    devices: {
      phone: "Mobile apps",
      laptop: "Web portals",
      tablet: "Employee apps",
      dashboard: "Dashboards",
    },
    api: "Integration APIs",
  },
  transform: {
    core: "BUSINESS",
    satellites: ["AI", "Data", "Cloud", "Apps", "Automation", "Enterprise Systems"],
  },
} as const;

export const valueStrip = [
  { title: "Business-led", body: "Technology aligned to outcomes", icon: "compass" },
  { title: "AI-enabled", body: "Intelligence embedded in work", icon: "spark" },
  { title: "Enterprise-ready", body: "Secure and scalable by design", icon: "shield" },
  { title: "End-to-end", body: "Strategy through managed services", icon: "loop" },
] as const;

export const services = {
  eyebrow: "Services",
  title: "Technology services built around business value.",
  intro:
    "Six service families that work together, from the first AI use case to the systems that run every day.",
  items: [
    {
      step: "01",
      title: "Artificial Intelligence",
      points: ["Generative AI & Copilots", "AI Agents & Automation", "Document Intelligence"],
      icon: "spark",
    },
    {
      step: "02",
      title: "Application Services",
      points: ["Custom Application Development", "Application Modernization", "Integration & APIs"],
      icon: "code",
    },
    {
      step: "03",
      title: "Cloud & Infrastructure",
      points: ["Cloud Transformation", "Infrastructure Modernization", "DevOps & Platform Services"],
      icon: "cloud",
    },
    {
      step: "04",
      title: "Data & Analytics",
      points: ["Data Platforms", "Business Intelligence", "Advanced Analytics"],
      icon: "chart",
    },
    {
      step: "05",
      title: "Enterprise Solutions",
      points: ["ERP & CRM", "Project & Asset Platforms", "Business Process Transformation"],
      icon: "nodes",
    },
    {
      step: "06",
      title: "Managed IT Services",
      points: ["Application Support", "Cloud Operations", "Service Management"],
      icon: "headset",
    },
  ],
} as const;

export const aiSection = {
  eyebrow: "AI Solutions",
  title: "From AI potential to practical enterprise value.",
  intro:
    "VBloom helps businesses identify high-value use cases, build responsible solutions and integrate AI into the way people already work.",
  items: [
    { title: "AI Assistants", body: "Connect employees with organisational knowledge.", icon: "chat" },
    {
      title: "Intelligent Automation",
      body: "Allow AI and workflows to automate routine processes.",
      icon: "loop",
    },
    {
      title: "Document Intelligence",
      body: "Understand large volumes of enterprise documents.",
      icon: "doc",
    },
    {
      title: "Data Intelligence",
      body: "Turn enterprise information into actionable insights.",
      icon: "chart",
    },
  ],
  /** The mock assistant beside the capabilities. It is an illustration, not a product screenshot. */
  mock: {
    badge: "Illustrative interface",
    title: "Enterprise assistant",
    question: "Which supplier invoices are waiting on approval this week?",
    answer:
      "I found the invoices waiting on approval and grouped them by approver. Shall I send each approver a reminder?",
    sources: ["Finance system", "Contracts", "Approval workflow"],
    actions: ["Send reminders", "Open report"],
  },
} as const;

export const industries = {
  eyebrow: "Industries",
  title: "Technology with industry context.",
  intro:
    "We focus on a selected set of industries, so every engagement starts from how your sector actually works.",
  items: [
    {
      name: "Construction & Real Estate",
      body: "Project controls, site data and asset platforms.",
      icon: "building",
    },
    { name: "Financial Services", body: "Automation, trusted data and digital channels.", icon: "bank" },
    {
      name: "Manufacturing",
      body: "Connected operations, quality and supply chain insight.",
      icon: "factory",
    },
    { name: "Healthcare", body: "Secure data and patient-centred digital services.", icon: "pulse" },
    { name: "Retail & Consumer", body: "Customer data, unified commerce and demand insight.", icon: "bag" },
    { name: "Public Sector", body: "Citizen services and modernised core systems.", icon: "landmark" },
  ],
} as const;

export const about = {
  eyebrow: "About VBloom",
  positioning: "A technology partner focused on meaningful transformation.",
  body: "VBloom combines advisory, engineering, cloud, data, enterprise platforms and AI. These are not independent service towers. They work together, so strategy, technology and delivery move as one.",
  disciplines: ["Advisory", "Engineering", "Cloud", "Data", "Enterprise Platforms", "AI"],
  closing: "Not separate towers. One connected team.",
} as const;

export const insights = {
  eyebrow: "Insights",
  title: "Perspectives on enterprise transformation.",
  intro: "Articles, whitepapers and perspectives will be published here as our work develops.",
  status: "Coming soon",
  items: [
    { topic: "AI & Automation", title: "Moving from AI experimentation to enterprise value" },
    { topic: "Cloud Transformation", title: "Building a resilient digital foundation" },
    { topic: "Data & Analytics", title: "Creating a trusted, intelligent enterprise" },
  ],
} as const;

export const finalCta = {
  eyebrow: "Let's Work Together",
  title: "What could technology unlock for your business?",
  body: "Talk to VBloom about your AI, digital and technology priorities.",
  cta: { label: "Start a Conversation", href: "#contact" },
} as const;

export const contact = {
  eyebrow: "Contact",
  title: "Start a conversation",
  intro:
    "Tell us where the complexity is today. We will come back with honest thoughts on where technology and AI can help, and where they can't.",
  // Set NEXT_PUBLIC_CONTACT_ENDPOINT to a form backend (Formspree, Basin, your own API)
  // to receive submissions. Without it the form falls back to opening the visitor's email client.
  services: [
    "Artificial Intelligence",
    "Application Services",
    "Cloud & Infrastructure",
    "Data & Analytics",
    "Enterprise Solutions",
    "Managed IT Services",
    "Something else",
  ],
} as const;

/** Palettes offered by the floating theme picker. The first, Bliss, is the default. */
export const themes = {
  label: "Theme",
  hint: "Preview a colour theme",
  options: [
    {
      id: "bliss",
      name: "Bliss",
      note: "Default · periwinkle and mint",
      colors: ["#0b0c22", "#6466f1", "#9d8cff", "#2ee6b8"],
    },
    {
      id: "violet",
      name: "Violet Night",
      note: "The brief's palette",
      colors: ["#0b0912", "#7651d7", "#b069ff", "#45dcbc"],
    },
    {
      id: "ocean",
      name: "Ocean",
      note: "Enterprise blue",
      colors: ["#060b17", "#2f6bea", "#38bdf8", "#34e0c2"],
    },
    {
      id: "graphite",
      name: "Graphite",
      note: "Quiet and corporate",
      colors: ["#0a0c11", "#3b5bdb", "#8aa2ff", "#63e6be"],
    },
    {
      id: "emerald",
      name: "Emerald",
      note: "Growth green",
      colors: ["#06100d", "#0c9a72", "#3ad29f", "#7dd3fc"],
    },
    {
      id: "sunset",
      name: "Sunset",
      note: "Warm and bold",
      colors: ["#12080e", "#d9466c", "#ff8a5b", "#ffc857"],
    },
  ],
} as const;

export type ThemeId = (typeof themes.options)[number]["id"];
