import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getLocalizedProjects } from "../lib/content";

const SITE_URL = "https://edselserrano.com";

export const GET: APIRoute = async () => {
  const projects = await getLocalizedProjects("es");
  const items = projects.map((post) => ({
    title: post.title,
    description: post.description,
    pubDate: post.pubDate,
    link: `/blog/${post.id}`,
    categories: post.tags,
    author: post.author,
  }));

  return rss({
    title: "Edsel Serrano - Blog",
    description:
      "Proyectos, notas técnicas y experiencias de desarrollo web de Edsel Serrano.",
    site: SITE_URL,
    items,
    customData: "<language>es-ES</language>",
  });
};
