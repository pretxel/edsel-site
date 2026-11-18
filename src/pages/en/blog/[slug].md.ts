/**
 * Markdown rendition of a blog post page (en), advertised from the HTML page via
 * `<link rel="alternate" type="text/markdown">` and linked from /llms.txt.
 */
import type { APIRoute } from "astro";
import { getPostBySlug } from "../../../lib/content";
import {
  markdownResponse,
  notFoundResponse,
  postMarkdown,
  postPath,
} from "../../../lib/llms";

export const GET: APIRoute = async ({ params }) => {
  const entry = params.slug ? await getPostBySlug(params.slug) : undefined;
  // Posts are one file per language; only serve it under its own prefix.
  if (!entry || entry.data.lang !== "en") return notFoundResponse();
  return markdownResponse(postMarkdown(entry), postPath(entry.id, "en"));
};
