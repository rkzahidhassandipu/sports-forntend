import { BlogPosts } from "@/components/home/BlogPreview";
import { HeroSection } from "@/components/home/HeroSection";
import {
  FeaturesSection,
  CategoriesSection,
  PopularSessionsSection,
  StatsSection,
  OffersSection,
  TestimonialsSection,
  FAQSection,
} from "@/components/home/HomeSections";
import { Newsletter } from "@/components/home/NewsletterSubscribers";
import { PopularSessions } from "@/components/home/PopularSessions";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <PopularSessions />
      <StatsSection />
      <OffersSection />
      <TestimonialsSection />
      <BlogPosts />
      <FAQSection />
      <Newsletter />
    </div>
  );
}
