import { defineConfig } from "astro/config";
import robotsTxt from "astro-robots-txt";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://edselserrano.com/",
  output: "server",
  adapter: vercel({
    analytics: true,
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    sitemap(),
    svelte(),
    react(),
    compress({ SVG: false }),
  ],
});
