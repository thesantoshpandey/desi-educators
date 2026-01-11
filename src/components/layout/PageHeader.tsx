import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export const PageHeader = ({ title, subtitle, breadcrumbs = [] }: PageHeaderProps) => {
    return (
        <div className="bg-neutral-50 border-b border-neutral-200">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-neutral-500 mb-4">
                    <Link href="/" className="hover:text-red-700 transition-colors">
                        <Home size={16} />
                    </Link>
                    {breadcrumbs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <ChevronRight size={14} className="mx-2 text-neutral-400" />
                            {item.href ? (
                                <Link href={item.href} className="hover:text-red-700 transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-neutral-900 font-medium">{item.label}</span>
                            )}
                        </div>
                    ))}
                </nav>

                <h1 className="text-3xl font-bold text-neutral-900 mb-2">{title}</h1>
                {subtitle && <p className="text-neutral-500 max-w-2xl">{subtitle}</p>}
            </div>
        </div>
    );
};
