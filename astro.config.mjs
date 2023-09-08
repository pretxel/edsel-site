import { defineConfig } from "astro/config";
import robotsTxt from "astro-robots-txt";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel/serverless";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://edselserrano.com/",
  output: "server",
  adapter: vercel({
    analytics: true,
  }),
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    sitemap(),
    tailwind(),
    svelte(),
    react(),
  ],
});
