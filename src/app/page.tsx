import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Experience } from "@/components/experience/Experience";
import { FinalCta } from "@/components/sections/FinalCta";
import { Impact } from "@/components/sections/Impact";
import { InnovationLab } from "@/components/sections/InnovationLab";
import { Pillars } from "@/components/sections/Pillars";
import { Product } from "@/components/sections/Product";
import { Scenarios } from "@/components/sections/Scenarios";
import { Services } from "@/components/sections/Services";
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
  sameAs: [company.social.linkedin, company.social.github],
};

export default function Home() {
  return (
    <>
      <a
        href="#services"
        className="focus:text-space-950 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip the journey
      </a>
      <Header />
      <main className="flex-1">
        {/* Layer 2 of the brief: the transformation story, with the site floating over it. */}
        <Experience />
        <div className="space-bg relative">
          <div aria-hidden="true" className="starfield pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <Services />
            <Product />
            <Scenarios />
            <Impact />
            <InnovationLab />
            <Pillars />
            <FinalCta />
            <Contact />
          </div>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />
    </>
  );
}
