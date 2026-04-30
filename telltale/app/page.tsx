import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedBooks from "@/components/landing/FeaturedBooks";
import Testimonials from "@/components/landing/Testimonials";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <FeaturedBooks />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
