import { posts } from './data';
import type { Language } from './i18n';

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    alternates?: { hreflang: string; href: string }[];
}

export function generateSitemapUrls(): SitemapUrl[] {
    const baseUrl = 'https://edselserrano.com';
    const today = new Date().toISOString().split('T')[0];

    const urls: SitemapUrl[] = [];

    // Homepage
    urls.push({
        loc: `${baseUrl}/`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 1.0,
        alternates: [
            { hreflang: 'es-ES', href: `${baseUrl}/` },
            { hreflang: 'en-US', href: `${baseUrl}/en/` },
            { hreflang: 'x-default', href: `${baseUrl}/` }
        ]
    });

    // LLM Context File
    urls.push({
        loc: `${baseUrl}/llm.txt`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
    });

    // Blog index pages
    urls.push({
        loc: `${baseUrl}/blog/`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
        alternates: [
            { hreflang: 'es-ES', href: `${baseUrl}/blog/` },
            { hreflang: 'en-US', href: `${baseUrl}/en/blog/` },
            { hreflang: 'x-default', href: `${baseUrl}/blog/` }
        ]
    });

    urls.push({
        loc: `${baseUrl}/en/blog/`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
        alternates: [
            { hreflang: 'es-ES', href: `${baseUrl}/blog/` },
            { hreflang: 'en-US', href: `${baseUrl}/en/blog/` },
            { hreflang: 'x-default', href: `${baseUrl}/blog/` }
        ]
    });

    // Individual blog posts
    posts.forEach(post => {
        // Spanish version
        urls.push({
            loc: `${baseUrl}/blog/${post.id}`,
            lastmod: post.date,
            changefreq: 'monthly',
            priority: 0.8,
            alternates: [
                { hreflang: 'es-ES', href: `${baseUrl}/blog/${post.id}` },
                { hreflang: 'en-US', href: `${baseUrl}/en/blog/${post.id}` },
                { hreflang: 'x-default', href: `${baseUrl}/blog/${post.id}` }
            ]
        });

        // English version
        urls.push({
            loc: `${baseUrl}/en/blog/${post.id}`,
            lastmod: post.date,
            changefreq: 'monthly',
            priority: 0.8,
            alternates: [
                { hreflang: 'es-ES', href: `${baseUrl}/blog/${post.id}` },
                { hreflang: 'en-US', href: `${baseUrl}/en/blog/${post.id}` },
                { hreflang: 'x-default', href: `${baseUrl}/blog/${post.id}` }
            ]
        });
    });

    return urls;
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetStart = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
    const urlsetEnd = '</urlset>';

    const urlElements = urls.map(url => {
        let urlXml = '  <url>\n';
        urlXml += `    <loc>${url.loc}</loc>\n`;

        if (url.lastmod) {
            urlXml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        }

        if (url.changefreq) {
            urlXml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        }

        if (url.priority !== undefined) {
            urlXml += `    <priority>${url.priority}</priority>\n`;
        }

        // Add hreflang alternates
        if (url.alternates) {
            url.alternates.forEach(alt => {
                urlXml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />\n`;
            });
        }

        urlXml += '  </url>';
        return urlXml;
    }).join('\n');

    return `${xmlHeader}\n${urlsetStart}\n${urlElements}\n${urlsetEnd}`;
}

export function generateSitemapIndex(): string {
    const baseUrl = 'https://edselserrano.com';
    const today = new Date().toISOString().split('T')[0];

    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const sitemapIndexStart = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const sitemapIndexEnd = '</sitemapindex>';

    const sitemaps = [
        {
            loc: `${baseUrl}/sitemap.xml`,
            lastmod: today
        }
    ];

    const sitemapElements = sitemaps.map(sitemap =>
        `  <sitemap>\n    <loc>${sitemap.loc}</loc>\n    <lastmod>${sitemap.lastmod}</lastmod>\n  </sitemap>`
    ).join('\n');

    return `${xmlHeader}\n${sitemapIndexStart}\n${sitemapElements}\n${sitemapIndexEnd}`;
}
