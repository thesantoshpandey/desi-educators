import React from 'react';

const RefundPage = () => {
    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-neutral-800">
            <div className="max-w-4xl mx-auto px-4 py-16 bg-white min-h-screen shadow-sm border-x border-neutral-200">
                {/* Header */}
                <header className="mb-12 border-b border-neutral-200 pb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Refund and Cancellation Policy</h1>
                    <p className="text-sm text-neutral-500">Effective Date: January 1, 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-10 text-[15px] leading-relaxed">

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Scope of Policy</h2>
                        <p>
                            Desi Educators Private Limited (DEPL) creates and sells intangible, digital study materials in the form of PDF documents and online access. This policy governs the refund and cancellation rights for all purchases made on the platform.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">2. No Refund Policy for Digital Goods</h2>
                        <p className="mb-3">
                            Due to the digital nature of our products, they are deemed to be "consumed" immediately upon the user receiving access or downloading the file. Unlike physical goods, digital content cannot be returned.
                        </p>
                        <div className="bg-neutral-50 p-4 border-l-4 border-red-500 rounded-r-md">
                            <span className="font-bold text-neutral-900 block mb-1">Strict No-Refund Clause:</span>
                            <p className="text-neutral-700">
                                <strong>All sales are final.</strong> Refunds will NOT be provided for:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-700">
                                <li>Accidental purchases.</li>
                                <li>Change of mind after purchase.</li>
                                <li>Content already accessed or downloaded.</li>
                                <li>Incompatibility with user devices (users are advised to check sample content first).</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Exceptions (Technical Failures)</h2>
                        <p>
                            A refund may be considered <strong>only</strong> in the following exceptional circumstance:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-700">
                            <li>
                                <strong>Double Payment:</strong> If your account was charged twice for the same transaction due to a technical glitch.
                            </li>
                            <li>
                                <strong>Non-Delivery:</strong> If payment was successfully captured, but the user was not granted access to the content within 48 hours, and the issue cannot be resolved by our technical team.
                            </li>
                        </ul>
                        <p className="mt-3">
                            In such cases, please email <a href="mailto:desieducators@outlook.com" className="text-red-700 hover:underline">desieducators@outlook.com</a> with the transaction ID. Verified refunds will be processed to the original payment method within 5-7 business days.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">4. Cancellation Policy</h2>
                        <p>
                            As our products are instant-access digital goods, there is no "cancellation" period once the content has been accessed. Cancellation is only applicable if the order is in a pending state and has not been processed.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RefundPage;
