import { defineConfig } from "astro/config";
import robotsTxt from "astro-robots-txt";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://edselserrano.com/",
  output: "server",
  adapter: vercel(),
  integrations: [
    robotsTxt({
      sitemap: false,
    }),
    sitemap(),
    icon(),
    react(),
    compress({ SVG: false }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
