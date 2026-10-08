import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { AiSolutions } from "@/components/sections/AiSolutions";
import { FinalCta } from "@/components/sections/FinalCta";
import { Industries } from "@/components/sections/Industries";
import { Insights } from "@/components/sections/Insights";
import { Services } from "@/components/sections/Services";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { company } from "@/content/site";

/** Organisation schema so search engines can read the company details. */
const organisationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  alternateName: company.name,
  description: company.description,
  email: company.email,
  telephone: company.phone,
  address: { "@type": "PostalAddress", addressLocality: company.location },
  sameAs: [company.social.linkedin],
};

export default function Home() {
  return (
    <>
      <a
        href="#services"
        className="focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <Header />
      <main className="flex-1">
        {/* Experience A: the 30-second story. Experience B: a calm, conventional site. */}
        <Hero />
        <ValueStrip />
        <Services />
        <AiSolutions />
        <Industries />
        <About />
        <Insights />
        <FinalCta />
        <Contact />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />
    </>
  );
}
