import { About } from "@/components/About";
import { Approach } from "@/components/Approach";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { WhyUs } from "@/components/WhyUs";
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
        className="focus:bg-brand-600 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Approach />
        <WhyUs />
        <About />
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
