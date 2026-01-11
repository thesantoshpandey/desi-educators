import React from 'react';
import { PageHeader } from '@/components/layout';
import { Target, BookOpen, Lightbulb, Users, Quote } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="About Us"
                subtitle="Democratizing medical education in India with high-yield, accessible content."
                breadcrumbs={[{ label: 'About', href: '/about' }]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="space-y-20">

                    {/* 1. Institution Overview */}
                    <section className="max-w-4xl">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Institution Overview</h2>
                        <div className="prose prose-lg text-neutral-600 leading-relaxed">
                            <p className="mb-6">
                                <span className="font-semibold text-neutral-900">Desi Educators Private Limited (DEPL)</span> is an Indian educational technology company headquartered in New Delhi. Registered under the Companies Act 2013, DEPL is dedicated to democratizing medical education in India by providing high-yield study materials for the National Eligibility cum Entrance Test (NEET).
                            </p>
                            <p>
                                Recognizing the disparity in access to quality coaching, DEPL leverages technology to deliver structured, concise, and expert-curated content directly to students' devices, removing financial and geographical barriers to entry.
                            </p>
                        </div>
                    </section>

                    {/* 2. Mission & Methodology */}
                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-8">Mission & Methodology</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Card 1: Mission */}
                            <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-100 transition-shadow hover:shadow-md">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-primary-color mb-6">
                                    <Target size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-3">Our Mission</h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    To bridge the gap between affordability and quality in competitive exam preparation, ensuring that every deserving aspirant has the resources to pursue a career in medicine.
                                </p>
                            </div>

                            {/* Card 2: Methodology */}
                            <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-100 transition-shadow hover:shadow-md">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-3">Evidence-Based Learning</h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    Content derived strictly from high-weightage topics and past exam patterns. We remove unnecessary complexity to focus purely on core concepts.
                                </p>
                            </div>

                            {/* Card 3: Accessibility */}
                            <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-100 transition-shadow hover:shadow-md">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-3">Universal Accessibility</h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    Providing premium resources at nominal costs to reach students in Tier 2 and Tier 3 cities, ensuring geography is never a barrier.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Leadership */}
                    <section className="bg-neutral-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                            <Quote size={400} />
                        </div>

                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Lightbulb className="text-yellow-400" />
                                Leadership
                            </h2>
                            <p className="text-neutral-300 text-lg leading-relaxed mb-8">
                                <strong className="text-white">Priya Pandey</strong> (Founder & Director) established Desi Educators with a singular vision: to ensure that financial constraints never stand in the way of a student's dream.
                            </p>

                            <blockquote className="border-l-4 border-primary-color pl-6 py-2">
                                <p className="text-xl md:text-2xl font-medium italic text-neutral-100">
                                    "Our goal is not just to teach, but to empower meaningful careers in medicine for students from every corner of India."
                                </p>
                            </blockquote>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default AboutPage;
