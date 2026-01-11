import React from 'react';
import { PageHeader } from '@/components/layout';
import { RefreshCw, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

const RefundPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Refund & Cancellation Policy"
                subtitle="Transparent and fair policies for our digital learning materials."
                breadcrumbs={[{ label: 'Refund Policy', href: '/refund-policy' }]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-8 md:p-12">
                    <div className="space-y-12">

                        {/* 1. Scope */}
                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">1. Scope of Policy</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                Desi Educators Private Limited (DEPL) creates and sells intangible, digital study materials in the form of PDF documents and online access. This policy governs the refund and cancellation rights for all purchases made on the platform.
                            </p>
                        </section>

                        {/* 2. No Refund */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-red-50 rounded-lg text-primary-color shrink-0">
                                    <XCircle size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">2. No Refund Policy for Digital Goods</h2>
                            </div>
                            <div className="pl-14">
                                <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                                    <p className="text-neutral-700 mb-4">
                                        Due to the digital nature of our products, they are deemed to be "consumed" immediately upon the user receiving access or downloading the file. Unlike physical goods, digital content cannot be returned.
                                    </p>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="font-bold text-red-700 mb-2">Strict No-Refund Clause:</p>
                                        <p className="text-red-900 text-sm mb-2"><strong>All sales are final.</strong> Refunds will NOT be provided for:</p>
                                        <ul className="list-disc pl-5 space-y-1 text-red-800 text-sm">
                                            <li>Accidental purchases.</li>
                                            <li>Change of mind after purchase.</li>
                                            <li>Content already accessed or downloaded.</li>
                                            <li>Incompatibility with user devices (please check samples first).</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Exceptions */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 shrink-0">
                                    <AlertCircle size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">3. Exceptions (Technical Failures)</h2>
                            </div>
                            <div className="pl-14 text-neutral-600">
                                <p className="mb-3">
                                    A refund may be considered <strong>only</strong> in the following exceptional circumstance:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <li className="bg-white p-4 rounded-lg border border-neutral-100">
                                        <strong className="text-neutral-900 block mb-1">Double Payment</strong>
                                        If your account was charged twice for the same transaction due to a technical glitch.
                                    </li>
                                    <li className="bg-white p-4 rounded-lg border border-neutral-100">
                                        <strong className="text-neutral-900 block mb-1">Non-Delivery</strong>
                                        If payment was captured but access was not granted within 48 hours, and we cannot resolve it.
                                    </li>
                                </ul>
                                <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded">
                                    In such cases, please email <a href="mailto:desieducators@outlook.com" className="font-semibold underline">desieducators@outlook.com</a> with the transaction ID.
                                </p>
                            </div>
                        </section>

                        {/* 4. Cancellation */}
                        <section>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-2 bg-neutral-200 rounded-lg text-neutral-600 shrink-0">
                                    <RefreshCw size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 mt-1">4. Cancellation Policy</h2>
                            </div>
                            <div className="pl-14 text-neutral-600 leading-relaxed">
                                <p>
                                    As our products are instant-access digital goods, there is no "cancellation" period once the content has been accessed. Cancellation is only applicable if the order is in a pending state and has not been processed.
                                </p>
                            </div>
                        </section>

                        <div className="pt-8 border-t border-neutral-200 mt-8 text-center text-neutral-400 text-sm">
                            Effective Date: January 1, 2026
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPage;
