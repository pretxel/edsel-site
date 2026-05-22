/**
 * /llms-full.txt — concatenated Markdown dump of every page's content,
 * designed for ingestion by LLM crawlers and answer engines.
 *
 * Spec inspiration: https://llmstxt.org/
 *
 * The response is plain text/Markdown, UTF-8, with a stable section
 * ordering: site overview → about → projects (newest first) →
 * machine-readable feeds.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getLocalizedProjects } from "../lib/content";

const SITE_URL = "https://edselserrano.com";

function dataSection(body: string, lang: "es" | "en"): string {
  const re = new RegExp(
    `<section[^>]*data-lang="${lang}"[^>]*>([\\s\\S]*?)</section>`,
    "i",
  );
  const match = body.match(re);
  return (match ? match[1] : body).trim();
}

export const GET: APIRoute = async () => {
  const projects = await getLocalizedProjects("es");
  const aboutEntries = await getCollection("pages", ({ data }) => data.slug === "about");

  const lines: string[] = [];
  lines.push("# edselserrano.com — full content dump");
  lines.push("");
  lines.push(
    "> Concatenated Markdown of every public page on edselserrano.com. " +
      "Generated from the same content collection that powers the live site.",
  );
  lines.push("");
  lines.push(`Source: ${SITE_URL}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  // ── About ─────────────────────────────────────────────────────────
  for (const entry of aboutEntries) {
    const url =
      entry.data.lang === "en" ? `${SITE_URL}/en/about` : `${SITE_URL}/about`;
    lines.push("---");
    lines.push("");
    lines.push(`## ${entry.data.title} (${entry.data.lang})`);
    lines.push("");
    lines.push(`Source: ${url}`);
    if (entry.data.description) {
      lines.push(`Summary: ${entry.data.description}`);
    }
    if (entry.data.updated) {
      lines.push(`Last updated: ${entry.data.updated.toISOString().slice(0, 10)}`);
    }
    lines.push("");
    lines.push(entry.body?.trim() ?? "");
    lines.push("");
  }

  // ── Projects ─────────────────────────────────────────────────────
  for (const project of projects) {
    const entry = project.entry;
    const body = entry.body ?? "";
    const esBody = dataSection(body, "es");
    const enBody = dataSection(body, "en");

    lines.push("---");
    lines.push("");
    lines.push(`## Project · ${entry.data.title}`);
    lines.push("");
    lines.push(`Source (es): ${SITE_URL}/projects/${entry.id}`);
    lines.push(`Source (en): ${SITE_URL}/en/projects/${entry.id}`);
    if (entry.data.externalLink) {
      lines.push(`Live: ${entry.data.externalLink}`);
    }
    lines.push(`Date: ${entry.data.date.toISOString().slice(0, 10)}`);
    if (entry.data.tags?.length) {
      lines.push(`Tags: ${entry.data.tags.join(", ")}`);
    }
    lines.push("");
    lines.push(`### ${entry.data.i18n.es.title} (es)`);
    lines.push("");
    lines.push(entry.data.i18n.es.description);
    lines.push("");
    if (esBody) {
      lines.push(esBody);
      lines.push("");
    }
    lines.push(`### ${entry.data.i18n.en.title} (en)`);
    lines.push("");
    lines.push(entry.data.i18n.en.description);
    lines.push("");
    if (enBody) {
      lines.push(enBody);
      lines.push("");
    }
  }

  // ── Feeds ────────────────────────────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push("## Machine-readable feeds");
  lines.push("");
  lines.push(`- Sitemap: ${SITE_URL}/sitemap-index.xml`);
  lines.push(`- RSS (es): ${SITE_URL}/rss.xml`);
  lines.push(`- RSS (en): ${SITE_URL}/en/rss.xml`);
  lines.push(`- llms.txt: ${SITE_URL}/llms.txt`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
};
