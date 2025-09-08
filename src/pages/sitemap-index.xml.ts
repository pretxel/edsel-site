import type { APIRoute } from 'astro';
import { generateSitemapIndex } from '../lib/sitemap';

export const GET: APIRoute = () => {
    const xmlContent = generateSitemapIndex();

    return new Response(xmlContent, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'max-age=3600, s-maxage=3600'
        }
    });
};
