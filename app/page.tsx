"use client";

import dynamic from "next/dynamic";
import { cardShadowClass, headingClass, sectionPad } from "@/components/home/homeTheme";
import HeroSection from "@/components/home/sections/HeroSection";
import SectionSkeleton from "@/components/home/sections/SectionSkeleton";
import TwoPathsSection from "@/components/home/sections/TwoPathsSection";

const HowItWorksSection = dynamic(
  () => import("@/components/home/sections/HowItWorksSection"),
  {
    ssr: false,
    loading: () => <SectionSkeleton id="how-it-works" className="py-14 md:py-[10vh]" />,
  },
);

const CoachesSection = dynamic(() => import("@/components/home/sections/CoachesSection"), {
  ssr: false,
  loading: () => <SectionSkeleton id="coaches" className="py-12 md:min-h-[100svh]" />,
});

const ClientsSection = dynamic(() => import("@/components/home/sections/ClientsSection"), {
  ssr: false,
  loading: () => <SectionSkeleton id="clients" className="py-12 md:min-h-[100svh]" />,
});

const TrustSection = dynamic(() => import("@/components/home/sections/TrustSection"), {
  ssr: false,
  loading: () => <SectionSkeleton id="trust" className="py-14 md:py-20" />,
});

const PricingSection = dynamic(() => import("@/components/home/sections/PricingSection"), {
  ssr: false,
  loading: () => <SectionSkeleton id="pricing" className="py-14 md:py-20" />,
});

const FaqSection = dynamic(() => import("@/components/home/sections/FaqSection"), {
  ssr: false,
  loading: () => <SectionSkeleton id="faq" className="py-14 md:py-20" />,
});

const FinalCtaSection = dynamic(() => import("@/components/home/sections/FinalCtaSection"), {
  ssr: false,
  loading: () => (
    <SectionSkeleton className="py-14 md:flex md:min-h-[100svh] md:items-center md:justify-center" />
  ),
});

const ContactSection = dynamic(() => import("@/components/home/sections/ContactSection"), {
  ssr: false,
  loading: () => (
    <SectionSkeleton id="contact" className="pb-10 pt-14 md:pb-8 md:pt-[10vh]" />
  ),
});

const RealResultsCarousel = dynamic(
  () => import("@/components/home/sections/RealResultsCarousel"),
  {
  ssr: false,
  loading: () => <SectionSkeleton id="results" className="py-14 md:py-20" />,
  },
);

export default function HomePage() {
  return (
    <div className="bg-[#F8FAFC] text-[#0F172A]">
      <HeroSection />
      <TwoPathsSection />
      <HowItWorksSection />

      <RealResultsCarousel
        sectionPad={sectionPad}
        headingClass={headingClass}
        cardShadowClass={cardShadowClass}
      />

      <CoachesSection />
      <ClientsSection />
      <TrustSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <ContactSection />
    </div>
  );
}
