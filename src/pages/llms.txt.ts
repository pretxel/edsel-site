/**
 * /llms.txt — link index for LLM crawlers and answer engines, following the
 * layout proposed at https://llmstxt.org/. Generated from the content
 * collections (see src/lib/llms.ts); there is deliberately no static copy
 * in /public, which would shadow this route and drift out of date.
 */
import type { APIRoute } from "astro";
import { buildLlmsTxt, TEXT_CACHE_CONTROL } from "../lib/llms";

export const GET: APIRoute = async () =>
  new Response(await buildLlmsTxt(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": TEXT_CACHE_CONTROL,
    },
  });
