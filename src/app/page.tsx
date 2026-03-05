import { Hero, SubjectSection, Features, EpisodePreview, NCERTSection, PriyaAICTA } from "@/components/home";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Desi Educators | Crack NEET 2026 with Priya Ma'am",
  description: "Crack NEET 2026 with Priya Ma'am. Biology, Physics, Chemistry. MSc Gold Medalist teaching since 2017. NCERT errors corrected. AI tutor. Free lectures.",
  alternates: { canonical: 'https://www.desieducators.com' },
};

export default function Home() {
  return (
    <>
      <Hero />
      <SubjectSection />
      <EpisodePreview />
      <NCERTSection />
      <Features />
      <PriyaAICTA />
    </>
  );
}
