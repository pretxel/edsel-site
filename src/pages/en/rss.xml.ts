import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getLocalizedProjects } from "../../lib/content";

const SITE_URL = "https://edselserrano.com";

export const GET: APIRoute = async () => {
  const projects = await getLocalizedProjects("en");
  const items = projects.map((post) => ({
    title: post.title,
    description: post.description,
    pubDate: post.pubDate,
    link: `/en/blog/${post.id}`,
    categories: post.tags,
    author: post.author,
  }));

  return rss({
    title: "Edsel Serrano - Blog",
    description:
      "Projects, technical notes, and web development experiences by Edsel Serrano.",
    site: SITE_URL,
    items,
    customData: "<language>en-US</language>",
  });
};
