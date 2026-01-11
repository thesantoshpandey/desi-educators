import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: { label: string; href: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs }) => {
    return (
        <div className="bg-neutral-50 border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="max-w-3xl">
                    {breadcrumbs && (
                        <nav className="flex items-center text-sm text-neutral-500 mb-4">
                            <Link href="/" className="hover:text-primary-color transition-colors">
                                Home
                            </Link>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb.href}>
                                    <ChevronRight size={14} className="mx-2" />
                                    <Link
                                        href={crumb.href}
                                        className={`${index === breadcrumbs.length - 1 ? 'text-neutral-900 font-medium' : 'hover:text-primary-color transition-colors'}`}
                                    >
                                        {crumb.label}
                                    </Link>
                                </React.Fragment>
                            ))}
                        </nav>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
