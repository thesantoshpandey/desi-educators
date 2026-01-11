import React from 'react';

const AboutPage = () => {
    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-neutral-800">
            <div className="max-w-4xl mx-auto px-4 py-16 bg-white min-h-screen shadow-sm border-x border-neutral-200">
                {/* Header */}
                <header className="mb-12 border-b border-neutral-200 pb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">About Us</h1>
                    <p className="text-sm text-neutral-500">Institution Profile & Overview</p>
                </header>

                {/* Content */}
                <div className="space-y-10 text-[15px] leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Institution Overview</h2>
                        <p className="mb-3">
                            <strong>Desi Educators Private Limited (DEPL)</strong> is an Indian educational technology company headquartered in New Delhi. Registered under the Companies Act 2013, DEPL is dedicated to democratizing medical education in India by providing high-yield study materials for the National Eligibility cum Entrance Test (NEET).
                        </p>
                        <p className="text-neutral-700">
                            Recognizing the disparity in access to quality coaching, DEPL leverages technology to deliver structured, concise, and expert-curated content directly to students' devices, removing financial and geographical barriers to entry.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">2. Mission & Methodology</h2>
                        <p className="mb-2"><strong>Our Mission:</strong> To bridge the gap between affordability and quality in competitive exam preparation, ensuring that every deserving aspirant has the resources to pursue a career in medicine.</p>
                        <p className="mb-2"><strong>Our Methodology:</strong> We believe in a focused approach:</p>
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                            <li><strong>Evidence-Based Learning:</strong> Content derived strictly from high-weightage topics and past exam patterns.</li>
                            <li><strong>Core Simplicity:</strong> Removing unnecessary complexity to focus purely on core concepts required for the exam.</li>
                            <li><strong>Universal Accessibility:</strong> Providing premium resources at nominal costs to reach students in Tier 2 and Tier 3 cities.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Leadership</h2>
                        <p className="mb-3">
                            <strong>Priya Pandey</strong> (Founder & Director) established Desi Educators with a singular vision: to ensure that financial constraints never stand in the way of a student's dream.
                        </p>
                        <blockquote className="text-neutral-600 italic text-sm border-l-2 border-neutral-300 pl-3">
                            "Our goal is not just to teach, but to empower meaningful careers in medicine for students from every corner of India."
                        </blockquote>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
