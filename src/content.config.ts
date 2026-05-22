import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Bilingual text shape used by project frontmatter.
 * Title + description per language so listing pages can render the
 * localized version without parsing MDX body.
 */
const i18nText = z.object({
  title: z.string(),
  description: z.string(),
});

/**
 * `projects` — externally-linked portfolio entries.
 * Each project is one MDX file with bilingual frontmatter and two
 * <section data-lang="es"|"en"> blocks in the body.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(), // neutral title (used as slug-friendly fallback)
    i18n: z.object({
      es: i18nText,
      en: i18nText,
    }),
    date: z.coerce.date(),
    cover: z.string(), // path under /public, e.g. /potato.webp
    externalLink: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    color: z.enum([
      "teal",
      "blue",
      "gray",
      "green",
      "yellow",
      "red",
      "pink",
      "orange",
    ]),
    featured: z.boolean().default(false),
    author: z.string().default("Edsel Serrano"),
  }),
});

/**
 * `posts` — long-form articles. One MDX per language (e.g. `slug-es.mdx`,
 * `slug-en.mdx`) because articles may not always be translated.
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(["es", "en"]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

export const collections = { projects, posts };
