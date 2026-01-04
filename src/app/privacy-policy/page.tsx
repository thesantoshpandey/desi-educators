import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-neutral-800">
            <div className="max-w-4xl mx-auto px-4 py-16 bg-white min-h-screen shadow-sm border-x border-neutral-200">
                {/* Header */}
                <header className="mb-12 border-b border-neutral-200 pb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
                    <p className="text-sm text-neutral-500">Last Updated: January 2026</p>
                </header>

                {/* Content */}
                <div className="space-y-10 text-[15px] leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Information Collection</h2>
                        <p className="mb-3">
                            Desi Educators Private Limited (DEPL) collects minimum necessary data to facilitate your transactions and learning experience. We may allow you to register using your name, email address, phone number, and academic preferences.
                        </p>
                        <p className="text-neutral-600 italic text-sm border-l-2 border-neutral-300 pl-3">
                            We do not collect sensitive personal data such as biometric information or health data.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">2. Use of Information</h2>
                        <p className="mb-2">The information collected is used for the following specific purposes:</p>
                        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                            <li>To provide access to the purchased digital content and dashboard features.</li>
                            <li>To communicate important updates regarding your account or course material.</li>
                            <li>To resolve technical issues and customer support queries.</li>
                            <li>To prevent fraud and ensure the security of our platform.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Data Protection & Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-3 text-neutral-700">
                            <li>
                                <strong>Payment Data:</strong> All financial transactions are processed through regulated payment gateways (Razorpay). DEPL does not store your credit/debit card numbers or net banking passwords.
                            </li>
                            <li>
                                <strong>Data Sharing:</strong> We do not sell, trade, or rent your personal identification information to third parties. Data is shared only with trusted partners essential for service delivery (e.g., payment processing, cloud hosting).
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">4. Your Rights (DPDP Act 2023)</h2>
                        <p>
                            In compliance with the Digital Personal Data Protection Act, 2023, you retain the right to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-2 text-neutral-700">
                            <li>Request a summary of personal data processed by us.</li>
                            <li>Request correction or completion of inaccurate data.</li>
                            <li>Request erasure of your personal data upon closure of your account, subject to legal retention requirements.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
