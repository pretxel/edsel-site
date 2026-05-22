/**
 * RSS feed (English).
 *
 * Mirrors the Spanish feed structure, sourcing posts where `lang === 'en'`
 * and projects' English localization.
 */
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getAllPosts, getLocalizedProjects } from "../../lib/content";

const SITE_URL = "https://edselserrano.com";

export const GET: APIRoute = async () => {
  const projects = await getLocalizedProjects("en");
  const posts = await getAllPosts("en");

  const projectItems = projects.map((p) => ({
    title: p.title,
    description: p.link
      ? `${p.description} — ${p.link}`
      : p.description,
    pubDate: p.pubDate,
    link: `/en/projects/${p.slug}`,
    categories: p.tags,
    author: p.author,
  }));

  const postItems = posts.map((p) => ({
    title: p.data.title,
    description: p.data.description,
    pubDate: p.data.date,
    link: `/en/blog/${p.id}`,
    categories: p.data.tags,
  }));

  const items = [...projectItems, ...postItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  return rss({
    title: "Edsel Serrano - Blog & Projects",
    description:
      "Articles, projects, and web development experiences by Edsel Serrano.",
    site: SITE_URL,
    items,
    customData: "<language>en-US</language>",
  });
};
