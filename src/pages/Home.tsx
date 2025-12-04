
import HeroSection from '@/components/home/HeroSection';
import LiveTicker from '@/components/home/LiveTicker';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import BookingCalendar from '@/components/home/BookingCalendar';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StatsSection from '@/components/home/StatsSection';
import FAQSection from '@/components/home/FAQSection';
import PricingSection from '@/components/home/PricingSection';
import CTASection from '@/components/home/CTASection';
import ElevenLabsChatbot from '@/components/ElevenLabsChatbot';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <LiveTicker />
      <FeaturesSection />
      <HowItWorksSection />
      <BookingCalendar />
      <TestimonialsSection />
      <StatsSection />
      <FAQSection />
      <PricingSection />
      <CTASection />
      <ElevenLabsChatbot />
    </main>
  );
}
