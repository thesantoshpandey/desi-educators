import React from 'react';
import { PageHeader } from '@/components/layout';
import { Shield, Lock, FileText, AlertTriangle } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Terms and Conditions"
                subtitle="Please read these terms carefully before using our services."
                breadcrumbs={[{ label: 'Terms', href: '/terms' }]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-8 md:p-12">
                    <div className="space-y-12">

                        {/* 1. Digital Products */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-red-50 rounded-lg text-primary-color shrink-0">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">1. Digital Products & Licensing</h2>
                            </div>
                            <div className="pl-14 space-y-4 text-neutral-600 leading-relaxed">
                                <p>
                                    All content, study materials, and PDF modules available on <span className="font-semibold text-neutral-900">desieducators.com</span> are the exclusive intellectual property of <strong>Desi Educators Private Limited (DEPL)</strong>.
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Upon successful payment, the user is granted a <strong>limited, non-exclusive, non-transferable license</strong> to access and use the materials for personal educational purposes only.
                                    </li>
                                    <li>
                                        This license does not grant any commercial rights or rights to redistribute the content in any form.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. IP Rights */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-600 shrink-0">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">2. Intellectual Property Rights</h2>
                            </div>
                            <div className="pl-14">
                                <div className="bg-red-50 border-l-4 border-primary-color p-4 rounded-r-lg">
                                    <p className="font-bold text-neutral-900 mb-1">Strict Prohibition against Piracy:</p>
                                    <p className="text-neutral-700 text-sm leading-relaxed">
                                        Users are strictly prohibited from copying, reproducing, distributing, modifying, or creating derivative works from our content. Sharing files on platforms such as Telegram, WhatsApp, Discord, or any public forum is a violation of this agreement and copyright laws.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Account Integrity */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">3. Account Integrity</h2>
                            </div>
                            <div className="pl-14 text-neutral-600 leading-relaxed">
                                <p>
                                    Each account is intended for use by a single individual student. DEPL monitors account activity using advanced algorithms.
                                    <span className="text-red-600 font-medium"> Multiple simultaneous logins</span> or suspicious patterns indicative of account sharing will result in automatic and permanent suspension of the account without refund.
                                </p>
                            </div>
                        </section>

                        {/* 4. Pricing */}
                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 mb-4 ml-14">4. Pricing & Payments</h2>
                            <ul className="list-disc pl-20 space-y-2 text-neutral-600">
                                <li>All prices listed on the website are in Indian Rupees (INR).</li>
                                <li>DEPL reserves the right to modify prices at any time without prior notice.</li>
                                <li>Access to purchased content is activated immediately upon confirmation of payment from our payment gateway partners.</li>
                            </ul>
                        </section>

                        {/* 5. Liability */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 shrink-0">
                                    <AlertTriangle size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">5. Limitation of Liability</h2>
                            </div>
                            <div className="pl-14 text-neutral-600 leading-relaxed">
                                <p>
                                    While we strive for accuracy, the study materials are provided on an "as is" basis. DEPL shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our services or potential errors in the content.
                                </p>
                            </div>
                        </section>

                        <div className="pt-8 border-t border-neutral-200 mt-8 text-center text-neutral-400 text-sm">
                            Last Updated: January 2026
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
