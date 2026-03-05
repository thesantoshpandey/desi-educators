import { Hero, SubjectSection, Features, EpisodePreview, NCERTSection, PriyaAICTA } from "@/components/home";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Desi Educators | NEET Biology with Priya Ma'am",
  description: "Learn NEET Biology from Priya Ma'am, MSc Gold Medalist and NCERT Curriculum Auditor. Free audio lectures, AI mentor, and concept-first teaching for NEET 2026.",
  alternates: {
    canonical: 'https://www.desieducators.com',
  },
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
