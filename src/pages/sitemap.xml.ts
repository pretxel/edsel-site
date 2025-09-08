import type { APIRoute } from 'astro';
import { generateSitemapUrls, generateSitemapXml } from '../lib/sitemap';

export const GET: APIRoute = () => {
    const urls = generateSitemapUrls();
    const xmlContent = generateSitemapXml(urls);

    return new Response(xmlContent, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'max-age=3600, s-maxage=3600'
        }
    });
};
