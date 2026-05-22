/**
 * RSS feed (Spanish).
 *
 * Combines:
 *   • Long-form posts (es) — uses MDX description.
 *   • Projects (es localization) — content = description + external link.
 *
 * Items are merged then sorted newest-first so a fresh project never gets
 * stuck behind older posts (or vice versa).
 */
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getAllPosts, getLocalizedProjects } from "../lib/content";

const SITE_URL = "https://edselserrano.com";

export const GET: APIRoute = async () => {
  const projects = await getLocalizedProjects("es");
  const posts = await getAllPosts("es");

  const projectItems = projects.map((p) => ({
    title: p.title,
    description: p.link
      ? `${p.description} — ${p.link}`
      : p.description,
    pubDate: p.pubDate,
    link: `/projects/${p.slug}`,
    categories: p.tags,
    author: p.author,
  }));

  const postItems = posts.map((p) => ({
    title: p.data.title,
    description: p.data.description,
    pubDate: p.data.date,
    link: `/blog/${p.id}`,
    categories: p.data.tags,
  }));

  const items = [...projectItems, ...postItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  return rss({
    title: "Edsel Serrano - Blog & Proyectos",
    description:
      "Artículos, proyectos y experiencias de desarrollo web de Edsel Serrano.",
    site: SITE_URL,
    items,
    customData: "<language>es-ES</language>",
  });
};
