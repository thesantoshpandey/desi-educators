import React from 'react';

const ContactPage = () => {
    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-neutral-800">
            <div className="max-w-4xl mx-auto px-4 py-16 bg-white min-h-screen shadow-sm border-x border-neutral-200">
                {/* Header */}
                <header className="mb-12 border-b border-neutral-200 pb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">Contact Us</h1>
                    <p className="text-sm text-neutral-500">Corporate Office & Student Support</p>
                </header>

                {/* Content */}
                <div className="space-y-10 text-[15px] leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Registered Corporate Office</h2>
                        <p className="mb-1 text-neutral-900 font-medium">Desi Educators Private Limited</p>
                        <p className="text-neutral-700">
                            C-180/A, 3rd Floor, Defence Colony<br />
                            New Delhi – 110024
                        </p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Registered under the Companies Act, 2013
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">2. Student Support</h2>
                        <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                            <li>
                                <strong>Email Support:</strong> <a href="mailto:desieducators@outlook.com" className="text-neutral-900 hover:text-red-700 underline decoration-neutral-300">desieducators@outlook.com</a>
                            </li>
                            <li>
                                <strong>Phone Support:</strong> <a href="tel:+917982626546" className="text-neutral-900 hover:text-red-700 underline decoration-neutral-300">+91-7982626546</a>
                            </li>
                            <li>
                                <strong>Working Hours:</strong> Monday to Saturday, 10:00 AM - 7:00 PM (IST)
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Grievance Redressal</h2>
                        <p className="mb-3">
                            In compliance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, you may contact our designated Grievance Officer for any concerns regarding data privacy or platform usage.
                        </p>
                        <div className="bg-neutral-50 p-4 border-l-4 border-neutral-300 rounded-r-md">
                            <p className="text-neutral-900 font-bold">Md. Amjad</p>
                            <p className="text-neutral-600 text-sm">Grievance Officer</p>
                            <a href="mailto:desieducators@outlook.com" className="text-neutral-900 hover:text-red-700 text-sm mt-1 inline-block underline decoration-neutral-300">desieducators@outlook.com</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
