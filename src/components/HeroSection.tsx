import React from "react";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, ctaText, ctaHref }) => (
  <section
    aria-labelledby="hero-section-title"
    className="text-center px-6 py-20 bg-gradient-to-r from-green-100 to-blue-100"
  >
    <h1 id="hero-section-title" className="text-5xl font-bold mb-4">
      {title}
    </h1>
    <p className="text-lg mb-8 text-gray-700">{subtitle}</p>
    <a href={ctaHref} aria-label={ctaText}>
      <Button size="lg">{ctaText}</Button>
    </a>
  </section>
);

export default HeroSection;
