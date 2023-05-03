import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
	site: 'https://edselserrano.com/',
	output: 'server',
	adapter: vercel({
		analytics: true
	  }),
	integrations: [react(), robotsTxt({
      	sitemap: false,
    })],
});
