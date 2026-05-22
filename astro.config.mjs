import { defineConfig } from "astro/config";
import robotsTxt from "astro-robots-txt";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import compress from "astro-compress";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";

// The Vercel adapter doesn't support `astro preview`, so when we want to run
// Lighthouse / smoke tests against a real production build locally we swap to
// the @astrojs/node adapter. Set ASTRO_ADAPTER=node to opt in.
const USE_NODE_ADAPTER = process.env.ASTRO_ADAPTER === "node";

// Legacy `/blog/<numeric-id>` URLs map to the new `/projects/<slug>` paths.
// Order is chronological (oldest first) — matches what `getProjectByLegacyId`
// returns, which is what the previous `/blog/N` pages resolved.
const LEGACY_PROJECT_REDIRECTS = {
  "/blog/1": "/projects/daily-potato",
  "/blog/2": "/projects/chat-edsel",
  "/blog/3": "/projects/dineqrs",
  "/blog/4": "/projects/f1-stats",
  "/blog/5": "/projects/pong-svelte",
  "/blog/6": "/projects/pokemon-poker",
  "/blog/7": "/projects/retro-ball",
  "/en/blog/1": "/en/projects/daily-potato",
  "/en/blog/2": "/en/projects/chat-edsel",
  "/en/blog/3": "/en/projects/dineqrs",
  "/en/blog/4": "/en/projects/f1-stats",
  "/en/blog/5": "/en/projects/pong-svelte",
  "/en/blog/6": "/en/projects/pokemon-poker",
  "/en/blog/7": "/en/projects/retro-ball",
};

// https://astro.build/config
export default defineConfig({
  site: "https://edselserrano.com/",
  output: "server",
  adapter: USE_NODE_ADAPTER ? node({ mode: "standalone" }) : vercel(),
  redirects: LEGACY_PROJECT_REDIRECTS,
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    // `@astrojs/sitemap` removed: it generates a static `sitemap-index.xml`
    // that shadows the richer SSR endpoint at `src/pages/sitemap-index.xml.ts`
    // (which references `/sitemap.xml` with hreflang alternates for every
    // project slug). Keep the custom pair as the single source of truth.
    icon(),
    react(),
    mdx(),
    compress({ SVG: false }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
