import React from 'react';

const TermsPage = () => {
    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-neutral-800">
            <div className="max-w-4xl mx-auto px-4 py-16 bg-white min-h-screen shadow-sm border-x border-neutral-200">
                {/* Header */}
                <header className="mb-12 border-b border-neutral-200 pb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Terms and Conditions</h1>
                    <p className="text-sm text-neutral-500">Last Updated: January 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-10 text-[15px] leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Digital Products & Licensing</h2>
                        <div className="pl-0 space-y-3">
                            <p>
                                All content, study materials, and PDF modules available on <span className="font-semibold">desieducators.com</span> are the exclusive intellectual property of <strong>Desi Educators Private Limited (DEPL)</strong>.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                                <li>
                                    Upon successful payment, the user is granted a <strong>limited, non-exclusive, non-transferable license</strong> to access and use the materials for personal educational purposes only.
                                </li>
                                <li>
                                    This license does not grant any commercial rights or rights to redistribute the content in any form.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">2. Intellectual Property Rights</h2>
                        <div className="bg-neutral-50 p-4 border-l-4 border-neutral-400 rounded-r-md">
                            <p className="font-medium text-neutral-900 mb-1">Strict Prohibition against Piracy:</p>
                            <p className="text-neutral-700">
                                Users are strictly prohibited from copying, reproducing, distributing, modifying, or creating derivative works from our content. Sharing files on platforms such as Telegram, WhatsApp, Discord, or any public forum is a violation of this agreement and copyright laws.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Account Integrity</h2>
                        <p>
                            Each account is intended for use by a single individual student. DEPL monitors account activity using advanced algorithms.
                            <strong>Multiple simultaneous logins</strong> or suspicious patterns indicative of account sharing will result in automatic and permanent suspension of the account without refund.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">4. Pricing & Payments</h2>
                        <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                            <li>All prices listed on the website are in Indian Rupees (INR).</li>
                            <li>DEPL reserves the right to modify prices at any time without prior notice.</li>
                            <li>Access to purchased content is activated immediately upon confirmation of payment from our payment gateway partners.</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">5. Limitation of Liability</h2>
                        <p>
                            While we strive for accuracy, the study materials are provided on an "as is" basis. DEPL shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our services or potential errors in the content.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
