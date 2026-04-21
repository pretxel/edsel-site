import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getLocalizedPosts } from "../../lib/data";

const SITE_URL = "https://edselserrano.com";

export const GET: APIRoute = async () => {
  const items = getLocalizedPosts("en")
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: new Date(post.date),
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
