import React from 'react';
import { PageHeader } from '@/components/layout';
import { Eye, Lock, Database, FileCheck } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Privacy Policy"
                subtitle="We value your trust and are committed to protecting your personal data."
                breadcrumbs={[{ label: 'Privacy', href: '/privacy-policy' }]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-8 md:p-12">
                    <div className="space-y-12">

                        {/* 1. Collection */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                    <Database size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">1. Information Collection</h2>
                            </div>
                            <div className="pl-14 space-y-4 text-neutral-600 leading-relaxed">
                                <p>
                                    Desi Educators Private Limited (DEPL) collects minimum necessary data to facilitate your transactions and learning experience. We may allow you to register using your name, email address, phone number, and academic preferences.
                                </p>
                                <div className="bg-white border text-sm text-neutral-500 p-4 rounded-lg italic">
                                    We do not collect sensitive personal data such as biometric information or health data.
                                </div>
                            </div>
                        </section>

                        {/* 2. Use */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0">
                                    <FileCheck size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">2. Use of Information</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-neutral-600 mb-3">The information collected is used for the following specific purposes:</p>
                                <ul className="list-disc pl-5 space-y-2 text-neutral-600">
                                    <li>To provide access to the purchased digital content and dashboard features.</li>
                                    <li>To communicate important updates regarding your account or course material.</li>
                                    <li>To resolve technical issues and customer support queries.</li>
                                    <li>To prevent fraud and ensure the security of our platform.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. Security */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-red-50 rounded-lg text-primary-color shrink-0">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">3. Data Protection & Security</h2>
                            </div>
                            <div className="pl-14 space-y-4 text-neutral-600">
                                <p>
                                    We implement industry-standard security measures to protect your personal information.
                                </p>
                                <ul className="space-y-4">
                                    <li className="bg-white p-4 rounded-lg border border-neutral-100">
                                        <strong className="text-neutral-900 block mb-1">Payment Data</strong>
                                        All financial transactions are processed through regulated payment gateways (Razorpay). DEPL does not store your credit/debit card numbers or net banking passwords.
                                    </li>
                                    <li className="bg-white p-4 rounded-lg border border-neutral-100">
                                        <strong className="text-neutral-900 block mb-1">Data Sharing</strong>
                                        We do not sell, trade, or rent your personal identification information to third parties. Data is shared only with trusted partners essential for service delivery (e.g., payment processing, cloud hosting).
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Rights */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 shrink-0">
                                    <Eye size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">4. Your Rights (DPDP Act 2023)</h2>
                            </div>
                            <div className="pl-14 text-neutral-600">
                                <p className="mb-3">
                                    In compliance with the Digital Personal Data Protection Act, 2023, you retain the right to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Request a summary of personal data processed by us.</li>
                                    <li>Request correction or completion of inaccurate data.</li>
                                    <li>Request erasure of your personal data upon closure of your account, subject to legal retention requirements.</li>
                                </ul>
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

export default PrivacyPage;
