/**
 * Markdown rendition of a project page (en), advertised from the HTML page via
 * `<link rel="alternate" type="text/markdown">` and linked from /llms.txt.
 */
import type { APIRoute } from "astro";
import { getProjectBySlug } from "../../../lib/content";
import {
  markdownResponse,
  notFoundResponse,
  projectMarkdown,
  projectPath,
} from "../../../lib/llms";

export const GET: APIRoute = async ({ params }) => {
  const entry = params.slug ? await getProjectBySlug(params.slug) : undefined;
  if (!entry) return notFoundResponse();
  return markdownResponse(
    projectMarkdown(entry, "en"),
    projectPath(entry.id, "en"),
  );
};
