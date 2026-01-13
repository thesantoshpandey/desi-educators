import { Hero, SubjectSection, Features } from "@/components/home";

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Desi Educators | Best NEET Preparation Platform",
  description: "Join Desi Educators for concept-first NEET preparation. Access high-quality notes, video lectures, and practice tests designed by experts.",
  alternates: {
    canonical: 'https://www.desieducators.com',
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <SubjectSection />
      <Features />
    </>
  );
}
