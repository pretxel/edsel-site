/**
 * /llms-full.txt — concatenated Markdown dump of every page's content,
 * designed for ingestion by LLM crawlers and answer engines.
 *
 * Spec inspiration: https://llmstxt.org/
 *
 * Stable section ordering: site overview → about → projects (newest first,
 * both languages) → posts (newest first, both languages) → feeds.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAllPosts, getLocalizedProjects } from "../lib/content";
import {
  dataSection,
  LLMS_INTRO,
  LLMS_SUMMARY,
  postPath,
  projectPath,
  TEXT_CACHE_CONTROL,
} from "../lib/llms";
import { SITE_URL } from "../lib/site";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const projects = await getLocalizedProjects("es");
  const aboutEntries = await getCollection(
    "pages",
    ({ data }) => data.kind === "about",
  );
  // `getAllPosts` already excludes drafts.
  const posts = [...(await getAllPosts("es")), ...(await getAllPosts("en"))].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const lines: string[] = [];
  lines.push("# Edsel Serrano — full content");
  lines.push("");
  lines.push(`> ${LLMS_SUMMARY}`);
  lines.push("");
  lines.push(LLMS_INTRO[0]);
  lines.push("");
  lines.push(
    "This document concatenates every public page on edselserrano.com, generated from the same content collections that power the live site.",
  );
  lines.push("");
  lines.push(`Source: ${SITE_URL}`);
  lines.push(`Index: ${SITE_URL}/llms.txt`);
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
      lines.push(`Last updated: ${isoDate(entry.data.updated)}`);
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
    lines.push(`Source (es): ${SITE_URL}${projectPath(entry.id, "es")}`);
    lines.push(`Source (en): ${SITE_URL}${projectPath(entry.id, "en")}`);
    if (entry.data.externalLink) {
      lines.push(`Live: ${entry.data.externalLink}`);
    }
    lines.push(`Date: ${isoDate(entry.data.date)}`);
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

  // ── Posts ────────────────────────────────────────────────────────
  for (const post of posts) {
    lines.push("---");
    lines.push("");
    lines.push(`## Article · ${post.data.title} (${post.data.lang})`);
    lines.push("");
    lines.push(`Source: ${SITE_URL}${postPath(post.id, post.data.lang)}`);
    lines.push(`Summary: ${post.data.description}`);
    lines.push(`Date: ${isoDate(post.data.date)}`);
    if (post.data.tags.length) {
      lines.push(`Tags: ${post.data.tags.join(", ")}`);
    }
    lines.push("");
    lines.push((post.body ?? "").trim());
    lines.push("");
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
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": TEXT_CACHE_CONTROL,
    },
  });
};
