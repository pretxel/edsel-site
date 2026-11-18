import { getCollection } from 'astro:content';
import { getAllPosts, getAllTags, getItemsByTagSlug, getLocalizedProjects, getSiblingPost } from './content';
import { getAlternates, hreflangCodes, type Language } from './i18n';
import { postPath } from './llms';
import { SITE_URL } from './site';
import { slugifyTag } from './tags';

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    alternates?: { hreflang: string; href: string }[];
}

const isoDate = (date: Date) => date.toISOString().split('T')[0];

/** Most recent of the given dates, as an ISO day; undefined when empty. */
function latest(dates: (Date | undefined)[]): string | undefined {
    const times = dates.filter((d): d is Date => !!d).map((d) => d.getTime());
    return times.length ? isoDate(new Date(Math.max(...times))) : undefined;
}

/** hreflang trio for a page whose variants differ only by the `/en` prefix. */
function alternatesFor(path: string): SitemapUrl['alternates'] {
    const { es, en, xDefault } = getAlternates(path);
    return [
        { hreflang: hreflangCodes.es, href: `${SITE_URL}${es}` },
        { hreflang: hreflangCodes.en, href: `${SITE_URL}${en}` },
        { hreflang: 'x-default', href: `${SITE_URL}${xDefault}` },
    ];
}

/**
 * Every public route in both languages.
 *
 * `lastmod` always derives from content: an entry's own date, or — for
 * index pages — the newest date among the entries it lists. It is never the
 * request date; crawlers learn to ignore `lastmod` on sites where it changes
 * on every fetch. Pages with no dated content omit it.
 */
export async function generateSitemapUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];

    const projects = await getLocalizedProjects('es');
    const posts = { es: await getAllPosts('es'), en: await getAllPosts('en') };
    const pages = await getCollection('pages');

    const projectsLastmod = latest(projects.map((p) => p.pubDate));
    const postsLastmod = (lang: Language) => latest(posts[lang].map((p) => p.data.date));
    const allPostsLastmod = latest([...posts.es, ...posts.en].map((p) => p.data.date));
    const siteLastmod = latest([
        ...projects.map((p) => p.pubDate),
        ...[...posts.es, ...posts.en].map((p) => p.data.date),
        ...pages.map((p) => p.data.updated),
    ]);

    /** Push the es + en variants of a prefix-swappable page. */
    const pushPair = (
        esPath: string,
        entry: Omit<SitemapUrl, 'loc' | 'alternates' | 'lastmod'>,
        lastmod: (lang: Language) => string | undefined,
    ) => {
        const { es, en } = getAlternates(esPath);
        for (const [lang, path] of [['es', es], ['en', en]] as const) {
            urls.push({
                loc: `${SITE_URL}${path}`,
                lastmod: lastmod(lang),
                ...entry,
                alternates: alternatesFor(esPath),
            });
        }
    };

    // Home — features the newest projects and posts.
    pushPair('/', { changefreq: 'weekly', priority: 1.0 }, () => siteLastmod);

    // About — `updated` frontmatter per language.
    pushPair('/about', { changefreq: 'monthly', priority: 0.8 }, (lang) =>
        latest(pages.filter((p) => p.data.kind === 'about' && p.data.lang === lang).map((p) => p.data.updated)),
    );

    // Index pages.
    pushPair('/projects/', { changefreq: 'weekly', priority: 0.9 }, () => projectsLastmod);
    pushPair('/blog/', { changefreq: 'weekly', priority: 0.7 }, (lang) => postsLastmod(lang) ?? allPostsLastmod);

    // Project detail pages.
    for (const project of projects) {
        pushPair(
            `/projects/${project.slug}`,
            { changefreq: 'monthly', priority: 0.8 },
            () => isoDate(project.pubDate),
        );
    }

    // Blog posts — slugs differ per language, so alternates come from the
    // translated sibling (when there is one) rather than a prefix swap.
    for (const lang of ['es', 'en'] as const) {
        for (const post of posts[lang]) {
            const sibling = await getSiblingPost(post);
            const esPost = lang === 'es' ? post : sibling;
            const enPost = lang === 'en' ? post : sibling;
            const alternates: SitemapUrl['alternates'] = [];
            if (esPost) alternates.push({ hreflang: hreflangCodes.es, href: `${SITE_URL}${postPath(esPost.id, 'es')}` });
            if (enPost) alternates.push({ hreflang: hreflangCodes.en, href: `${SITE_URL}${postPath(enPost.id, 'en')}` });
            if (esPost && enPost) alternates.push({ hreflang: 'x-default', href: `${SITE_URL}${postPath(esPost.id, 'es')}` });
            urls.push({
                loc: `${SITE_URL}${postPath(post.id, lang)}`,
                lastmod: isoDate(post.data.date),
                changefreq: 'monthly',
                priority: 0.7,
                alternates,
            });
        }
    }

    // Tag index + tag detail pages. Tag sets are per language, so a tag
    // detail page only lists an alternate when the tag exists in both.
    const tags = { es: await getAllTags('es'), en: await getAllTags('en') };
    const tagSlugs = {
        es: new Set(tags.es.map(slugifyTag)),
        en: new Set(tags.en.map(slugifyTag)),
    };
    pushPair('/tags/', { changefreq: 'weekly', priority: 0.6 }, () => siteLastmod);
    for (const lang of ['es', 'en'] as const) {
        const other: Language = lang === 'es' ? 'en' : 'es';
        for (const tag of tags[lang]) {
            const slug = slugifyTag(tag);
            const items = await getItemsByTagSlug(slug, lang);
            const esPath = `/tags/${slug}`;
            urls.push({
                loc: `${SITE_URL}${getAlternates(esPath)[lang]}`,
                lastmod: latest([
                    ...items.projects.map((p) => p.pubDate),
                    ...items.posts.map((p) => p.data.date),
                ]),
                changefreq: 'weekly',
                priority: 0.5,
                alternates: tagSlugs[other].has(slug)
                    ? alternatesFor(esPath)
                    : [{ hreflang: hreflangCodes[lang], href: `${SITE_URL}${getAlternates(esPath)[lang]}` }],
            });
        }
    }

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

/** Sitemap index; its `lastmod` is the newest `lastmod` in the sitemap. */
export async function generateSitemapIndex(): Promise<string> {
    const urls = await generateSitemapUrls();
    const lastmod = urls
        .map((url) => url.lastmod)
        .filter((value): value is string => !!value)
        .sort()
        .pop();

    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const sitemapIndexStart = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const sitemapIndexEnd = '</sitemapindex>';

    const sitemapElement =
        `  <sitemap>\n    <loc>${SITE_URL}/sitemap.xml</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
        '  </sitemap>';

    return `${xmlHeader}\n${sitemapIndexStart}\n${sitemapElement}\n${sitemapIndexEnd}`;
}
