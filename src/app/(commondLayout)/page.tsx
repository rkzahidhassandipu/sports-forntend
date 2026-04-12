import { HeroSection } from "@/components/home/HeroSection";
import {
  FeaturesSection,
  CategoriesSection,
  PopularSessionsSection,
  StatsSection,
  OffersSection,
  TestimonialsSection,
  FAQSection,
  NewsletterSection,
} from "@/components/home/HomeSections";
import { BlogPreviewSection } from "@/components/home/BlogPreview";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <PopularSessionsSection />
      <StatsSection />
      <OffersSection />
      <TestimonialsSection />
      <BlogPreviewSection />
      <FAQSection />
      <NewsletterSection />
    </div>
  );
}
