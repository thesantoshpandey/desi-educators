import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.desieducators.com';

    const staticPages = [
        { url: baseUrl, changeFrequency: 'weekly' as const, priority: 1 },
        { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${baseUrl}/neet`, changeFrequency: 'weekly' as const, priority: 0.9 },
        { url: `${baseUrl}/pricing`, changeFrequency: 'weekly' as const, priority: 0.9 },
        { url: `${baseUrl}/contact`, changeFrequency: 'monthly' as const, priority: 0.6 },
        { url: `${baseUrl}/signup`, changeFrequency: 'yearly' as const, priority: 0.5 },
        { url: `${baseUrl}/login`, changeFrequency: 'yearly' as const, priority: 0.5 },
        { url: `${baseUrl}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/terms`, changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/refund`, changeFrequency: 'yearly' as const, priority: 0.3 },
    ];

    // Subject pages for SEO
    const subjects = [
        'physics', 'biology', 'chemistry',
        'mnemonics', 'mock-test',
    ];

    const subjectPages = subjects.map(subject => ({
        url: `${baseUrl}/subjects/${subject}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Class-level pages
    const classPages = ['11', '12'].flatMap(cls =>
        subjects.map(subject => ({
            url: `${baseUrl}/subjects/${subject}/class-${cls}`,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    );

    return [...staticPages, ...subjectPages, ...classPages].map(page => ({
        ...page,
        lastModified: new Date(),
    }));
}
