import HeroSection from "@/components/HeroSection";
import BookSessionAndPackagesSection from "@/components/BookSessionAndPackagesSection";
import AboutSection from "@/components/AboutSection";
import DownloadSection from "@/components/DownloadSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import ContactSection from "@/components/ContactSection";

const Index = () => (
  <div className="min-h-screen bg-background">
    <HeroSection />
    <AboutSection />
    <DownloadSection />
    <BookSessionAndPackagesSection />
    <TestimonialsSection />
    <NewsletterSection />
    <ContactSection />
  </div>
);

export default Index;
