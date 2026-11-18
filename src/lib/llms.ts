/**
 * Shared building blocks for the LLM-facing endpoints:
 *   - /llms.txt            link index (llmstxt.org layout)
 *   - /llms-full.txt       every page's content in one document
 *   - /<page>.md           Markdown rendition of a single project or post
 *
 * All three are generated from the content collections, so adding a project
 * or publishing a post updates them without touching this file.
 */
import {
  getAllPosts,
  getAllTags,
  getLocalizedProjects,
  type PostEntry,
  type ProjectEntry,
} from "./content";
import type { Language } from "./i18n";
import { SITE_URL } from "./site";
import { slugifyTag } from "./tags";

export const LLMS_SUMMARY =
  "Personal site of Edsel Serrano — a Mexican software engineer based in Madrid, Spain, currently building at Embat (corporate-treasury fintech). The site is a portfolio of side projects with bilingual (Spanish / English) content.";

export const LLMS_INTRO = [
  "Edsel has 10+ years of experience shipping web products: internal tools for agile teams, conversational chatbots, real-time data dashboards, and bespoke web platforms. Stack focus: TypeScript, React, Next.js, Astro, Node, Postgres, Tailwind, Vercel, Supabase. Side interests: applied ML, IoT, agentic engineering.",
  "The site has two language variants — Spanish (default, `/`) and English (`/en/`). Every URL listed below has an English mirror under `/en/<same-path>` unless noted otherwise. Links ending in `.md` return clean Markdown for that page.",
];

/** Cache policy shared by the text endpoints: content only changes on deploy. */
export const TEXT_CACHE_CONTROL =
  "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Project MDX bodies hold both languages as `<section data-lang="…">`
 * blocks. Returns the inner Markdown of the requested one, or the whole
 * body when the file isn't split by language.
 */
export function dataSection(body: string, lang: Language): string {
  const re = new RegExp(
    `<section[^>]*data-lang="${lang}"[^>]*>([\\s\\S]*?)</section>`,
    "i",
  );
  const match = body.match(re);
  return (match ? match[1] : body).trim();
}

export function projectPath(slug: string, lang: Language): string {
  return lang === "en" ? `/en/projects/${slug}` : `/projects/${slug}`;
}

export function postPath(id: string, lang: Language): string {
  return lang === "en" ? `/en/blog/${id}` : `/blog/${id}`;
}

/** Markdown rendition of one project in one language. */
export function projectMarkdown(entry: ProjectEntry, lang: Language): string {
  const { data } = entry;
  const other: Language = lang === "en" ? "es" : "en";
  const lines = [
    `# ${data.i18n[lang].title}`,
    "",
    `> ${data.i18n[lang].description}`,
    "",
    `- URL: ${SITE_URL}${projectPath(entry.id, lang)}`,
    `- ${other === "en" ? "English" : "Spanish"} version: ${SITE_URL}${projectPath(entry.id, other)}.md`,
  ];
  if (data.externalLink) lines.push(`- Live project: ${data.externalLink}`);
  lines.push(`- Date: ${isoDate(data.date)}`);
  if (data.tags.length) lines.push(`- Stack: ${data.tags.join(", ")}`);
  lines.push(`- Author: ${data.author}`);
  lines.push(`- Language: ${lang}`);
  lines.push("");
  const body = dataSection(entry.body ?? "", lang);
  if (body) lines.push(body, "");
  return lines.join("\n");
}

/** Markdown rendition of one blog post (posts are single-language files). */
export function postMarkdown(entry: PostEntry): string {
  const { data } = entry;
  const lines = [
    `# ${data.title}`,
    "",
    `> ${data.description}`,
    "",
    `- URL: ${SITE_URL}${postPath(entry.id, data.lang)}`,
    `- Date: ${isoDate(data.date)}`,
  ];
  if (data.tags.length) lines.push(`- Tags: ${data.tags.join(", ")}`);
  lines.push("- Author: Edsel Serrano");
  lines.push(`- Language: ${data.lang}`);
  lines.push("");
  const body = (entry.body ?? "").trim();
  if (body) lines.push(body, "");
  return lines.join("\n");
}

/** Response for a single-page Markdown rendition. */
export function markdownResponse(markdown: string, canonicalPath: string) {
  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": TEXT_CACHE_CONTROL,
      // The HTML page is the indexable version; this copy is for agents.
      "x-robots-tag": "noindex",
      link: `<${SITE_URL}${canonicalPath}>; rel="canonical"`,
    },
  });
}

export function notFoundResponse() {
  return new Response("Not found\n", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

/** The /llms.txt index. */
export async function buildLlmsTxt(): Promise<string> {
  const projects = await getLocalizedProjects("en");
  const posts = {
    es: await getAllPosts("es"),
    en: await getAllPosts("en"),
  };
  const lines: string[] = [];
  lines.push("# Edsel Serrano", "", `> ${LLMS_SUMMARY}`, "");
  for (const paragraph of LLMS_INTRO) lines.push(paragraph, "");

  lines.push("## Core pages", "");
  lines.push(
    `- [Home (Spanish)](${SITE_URL}/): Hero introduction + featured projects.`,
    `- [Home (English)](${SITE_URL}/en/): English mirror of the homepage.`,
    `- [About (Spanish)](${SITE_URL}/about): Bio, current role at Embat, prior experience (CIC México, Secretaría de Relaciones Exteriores), education, certifications.`,
    `- [About (English)](${SITE_URL}/en/about): English mirror.`,
    `- [Projects index (Spanish)](${SITE_URL}/projects/): Every project, newest first.`,
    `- [Projects index (English)](${SITE_URL}/en/projects/): English mirror.`,
    "",
  );

  lines.push("## Projects", "");
  lines.push(
    "One entry per project, newest first. Links return the English write-up as Markdown; swap `/en/projects/` for `/projects/` to get the Spanish one, or drop `.md` for the HTML page.",
    "",
  );
  for (const project of projects) {
    const stack = project.tags.length
      ? ` Stack: ${project.tags.join(", ")}.`
      : "";
    const live = project.link ? ` Live: ${project.link}` : "";
    const description = project.description.replace(/\.?$/, ".");
    lines.push(
      `- [${project.title}](${SITE_URL}${projectPath(project.slug, "en")}.md): ${description}${stack}${live}`,
    );
  }
  lines.push("");

  lines.push("## Blog", "");
  const postCount = posts.es.length + posts.en.length;
  if (postCount === 0) {
    lines.push(
      "No long-form articles are published yet; the index routes are live.",
      "",
    );
  }
  for (const lang of ["es", "en"] as const) {
    for (const post of posts[lang]) {
      lines.push(
        `- [${post.data.title}](${SITE_URL}${postPath(post.id, lang)}.md): ${post.data.description} (${lang}, ${isoDate(post.data.date)})`,
      );
    }
  }
  if (postCount > 0) lines.push("");
  lines.push(
    `- [Blog index (Spanish)](${SITE_URL}/blog/): List of long-form articles.`,
    `- [Blog index (English)](${SITE_URL}/en/blog/): English mirror.`,
    `- [RSS (Spanish)](${SITE_URL}/rss.xml): Combined feed of posts + projects.`,
    `- [RSS (English)](${SITE_URL}/en/rss.xml): English combined feed.`,
    "",
  );

  const tags = await getAllTags("en");
  if (tags.length) {
    lines.push("## Topical tags", "");
    lines.push(
      "Tag-filtered indexes live at `/tags/<slug>` (and `/en/tags/<slug>`):",
      "",
    );
    for (const tag of tags) {
      lines.push(`- [${tag}](${SITE_URL}/en/tags/${slugifyTag(tag)})`);
    }
    lines.push("");
  }

  lines.push("## Optional", "");
  lines.push(
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): Every page's content concatenated into one Markdown document.`,
    `- [Sitemap index](${SITE_URL}/sitemap-index.xml): XML sitemap covering every public route in both languages, with hreflang alternates.`,
    "- Structured data: every HTML page embeds one JSON-LD `@graph` (`Person`, `WebSite`, plus `SoftwareApplication` on projects, `BlogPosting` on posts, `ProfilePage` on about).",
    "",
  );

  lines.push("## Contact", "");
  lines.push(
    "- LinkedIn: https://www.linkedin.com/in/edselserrano",
    "- GitHub: https://github.com/pretxel",
    "- Email: pretxel100@gmail.com",
    "",
  );

  lines.push("## Notes for LLM consumers", "");
  lines.push(
    "- Spanish (`es`) is the canonical default; English copies use the same content adapted, not auto-translated.",
    "- Project HTML pages contain both language write-ups (`<section data-lang=\"es\">` / `<section data-lang=\"en\">`), with the inactive one hidden via CSS. The `.md` renditions contain only the language of their URL.",
    "- Dates are ISO 8601. `updated` on `/about` reflects the last manual edit.",
    "- The site permits all major AI / LLM crawlers — see `robots.txt`.",
    "",
  );

  return lines.join("\n");
}
