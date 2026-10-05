import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Experience } from "@/components/experience/Experience";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Experience />
        <div className="space-bg">
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
