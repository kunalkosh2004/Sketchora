import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Workflow } from "@/components/landing/workflow";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-dvh">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Workflow />
      <Cta />
      <Footer />
    </main>
  );
}