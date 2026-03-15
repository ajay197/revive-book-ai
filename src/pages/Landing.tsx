import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import IndustriesSection from "@/components/landing/IndustriesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ROICalculator from "@/components/landing/ROICalculator";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/landing/ScrollToTop";

const Landing = () => {
  const { user, isReady } = useAuth();

  if (isReady && user) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <HowItWorksSection />
      <ROICalculator />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Landing;
