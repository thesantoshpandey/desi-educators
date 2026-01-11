import React from 'react';
import { PageHeader } from '@/components/layout';
import { Building2, Mail, Phone, Clock, MapPin, User, ShieldCheck } from 'lucide-react';

const ContactPage = () => {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Contact Us"
                subtitle="We're here to help you with your NEET preparation journey. Reach out to us for any queries or support."
                breadcrumbs={[{ label: 'Contact', href: '/contact' }]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                    {/* Left Column: Contact Methods */}
                    <div className="space-y-12">
                        {/* Corporate Office */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-primary-color">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 mb-2">Registered Corporate Office</h2>
                                <p className="text-neutral-900 font-medium mb-1">Desi Educators Private Limited</p>
                                <p className="text-neutral-600 leading-relaxed mb-2">
                                    C-180/A, 3rd Floor, Defence Colony<br />
                                    New Delhi – 110024
                                </p>
                                <p className="text-sm text-neutral-500 bg-neutral-50 inline-block px-2 py-1 rounded">
                                    Registered under the Companies Act, 2013
                                </p>
                            </div>
                        </div>

                        {/* Student Support */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-primary-color">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 mb-4">Student Support</h2>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-neutral-600">
                                        <Mail size={18} className="text-primary-color" />
                                        <span>
                                            Email: <a href="mailto:desieducators@outlook.com" className="text-neutral-900 font-medium hover:text-primary-color transition-colors">desieducators@outlook.com</a>
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-3 text-neutral-600">
                                        <Phone size={18} className="text-primary-color" />
                                        <span>
                                            Phone: <a href="tel:+917982626546" className="text-neutral-900 font-medium hover:text-primary-color transition-colors">+91-7982626546</a>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-neutral-600">
                                        <Clock size={18} className="text-primary-color mt-0.5" />
                                        <span>
                                            Mon - Sat: 10:00 AM - 7:00 PM (IST)
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Grievance & Map/Extra Info */}
                    <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck size={24} className="text-neutral-900" />
                            <h2 className="text-xl font-bold text-neutral-900">Grievance Redressal</h2>
                        </div>
                        <p className="text-neutral-600 mb-6 leading-relaxed">
                            In compliance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023, you may contact our designated Grievance Officer for any concerns regarding data privacy or platform usage.
                        </p>

                        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                            <p className="text-lg font-bold text-neutral-900 mb-1">Md. Amjad</p>
                            <p className="text-sm text-neutral-500 mb-4 uppercase tracking-wider font-semibold">Grievance Officer</p>

                            <a
                                href="mailto:desieducators@outlook.com"
                                className="flex items-center gap-2 text-primary-color font-medium hover:text-red-700 transition-colors"
                            >
                                <Mail size={16} />
                                desieducators@outlook.com
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactPage;
