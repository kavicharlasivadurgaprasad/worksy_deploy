import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import ServiceCarousel from '@/components/ServiceCarousel';
import FeatureCards from '@/components/FeatureCards';
import MatchingSection from '@/components/MatchingSection';
import SearchSection from '@/components/SearchSection';
import Testimonials from '@/components/Testimonials';
import BusinessShowcase from '@/components/BusinessShowcase';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Stats />
      <ServiceCarousel />
      <FeatureCards />
      <MatchingSection />
      <SearchSection />
      <Testimonials />
      <BusinessShowcase />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
