import { getCollection, type CollectionEntry } from "astro:content";
import { colors } from "./colors";
import type { Language } from "./i18n";

export type ProjectEntry = CollectionEntry<"projects">;
export type PostEntry = CollectionEntry<"posts">;
export type PageEntry = CollectionEntry<"pages">;

export type PageSlug = "about" | "now" | "uses";

/**
 * Bilingual-resolved view of a project. Mirrors the shape the pages used to
 * receive from `getLocalizedPost` so blog pages and PostCard can keep
 * rendering with minimal edits.
 *
 * The `content` / `content_p2` fields are intentionally absent — page bodies
 * now render via the MDX `<Content />` component instead of stringly-typed
 * content. Helpers preserve `description` so list views still render text.
 */
export interface LocalizedProject {
  id: string;
  slug: string;
  entry: ProjectEntry;
  /** Resolved title for the active language. */
  title: string;
  /** Resolved description for the active language. */
  description: string;
  /** Project cover under /public. */
  cover: string;
  /** External live-project link (was `link` in the legacy schema). */
  link?: string;
  /** ISO date string for compatibility with existing helpers (`formatDate`). */
  date: string;
  /** Date object for sorting / RSS. */
  pubDate: Date;
  tags: string[];
  author: string;
  /** Resolved color token (matches the legacy `post.color` shape). */
  color: (typeof colors)[keyof typeof colors];
  /** Whether the project is flagged as featured in frontmatter. */
  featured: boolean;
}

function toLocalized(
  entry: ProjectEntry,
  lang: Language,
  legacyId: string,
): LocalizedProject {
  const { data } = entry;
  const localized = data.i18n[lang];
  return {
    id: legacyId,
    slug: entry.id,
    entry,
    title: localized.title,
    description: localized.description,
    cover: data.cover,
    link: data.externalLink,
    date: data.date.toISOString(),
    pubDate: data.date,
    tags: data.tags,
    author: data.author,
    color: colors[data.color],
    featured: data.featured,
  };
}

/**
 * All projects, newest first.
 */
export async function getAllProjects(): Promise<ProjectEntry[]> {
  const all = await getCollection("projects");
  return all.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/**
 * Internal: chronological order (oldest first) drives legacy numeric ids.
 * Stays private so callers don't accidentally use this as the user-facing
 * ordering.
 */
async function getChronologicalProjects(): Promise<ProjectEntry[]> {
  const all = await getCollection("projects");
  return all.sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );
}

/**
 * Convenience wrapper: localized projects in the requested language,
 * sorted newest first. Each entry keeps its legacy numeric id so existing
 * /blog/N routes stay stable.
 */
export async function getLocalizedProjects(
  lang: Language,
): Promise<LocalizedProject[]> {
  const chronological = await getChronologicalProjects();
  // slug -> legacy id
  const idBySlug = new Map<string, string>(
    chronological.map((entry, i) => [entry.id, String(i + 1)]),
  );
  const newestFirst = [...chronological].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return newestFirst.map((entry) =>
    toLocalized(entry, lang, idBySlug.get(entry.id) ?? entry.id),
  );
}

/**
 * Featured projects for the homepage hero / highlights.
 */
export async function getFeaturedProjects(
  lang: Language,
  limit = 3,
): Promise<LocalizedProject[]> {
  const all = await getLocalizedProjects(lang);
  return all.filter((p) => p.featured).slice(0, limit);
}

/**
 * Localize a single project entry. Useful inside `[id].astro` once the
 * entry has been resolved.
 */
export async function getLocalizedProject(
  entry: ProjectEntry,
  lang: Language,
): Promise<LocalizedProject> {
  const legacyId = await getLegacyIdForProject(entry);
  return toLocalized(entry, lang, legacyId);
}

/**
 * Find a project by its content-collection id (the file basename, e.g.
 * `daily-potato`). Returns `undefined` if not found so callers can decide
 * how to handle the 404 case.
 */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectEntry | undefined> {
  const all = await getAllProjects();
  return all.find((entry) => entry.id === slug);
}

/**
 * Find a project by its legacy numeric id (`1`..`N`).
 *
 * The legacy `data.ts` ordering was chronological (oldest first), so we
 * preserve that here to keep `/blog/1`, `/blog/2`, … stable. The mapping is
 * computed dynamically so adding a new dated project re-numbers the back of
 * the list, never the front.
 *
 * Returns `undefined` if `legacyId` does not resolve to a known project.
 */
export async function getProjectByLegacyId(
  legacyId: string,
): Promise<ProjectEntry | undefined> {
  const index = Number.parseInt(legacyId, 10);
  if (!Number.isInteger(index) || index < 1) return undefined;

  const all = await getCollection("projects");
  const chronological = all.sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );
  return chronological[index - 1];
}

/**
 * Inverse of `getProjectByLegacyId` — useful when building related-project
 * links from a `ProjectEntry`.
 */
export async function getLegacyIdForProject(
  entry: ProjectEntry,
): Promise<string> {
  const all = await getCollection("projects");
  const chronological = all.sort(
    (a, b) => a.data.date.getTime() - b.data.date.getTime(),
  );
  const index = chronological.findIndex((e) => e.id === entry.id);
  return String(index + 1);
}

/**
 * All published (non-draft) posts in a given language, newest first.
 */
export async function getAllPosts(lang: Language): Promise<PostEntry[]> {
  const all = await getCollection(
    "posts",
    ({ data }) => data.lang === lang && !data.draft,
  );
  return all.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/**
 * Look up an evergreen page (`/about`, `/now`, `/uses`) for a given language.
 *
 * Resolution order:
 * 1. exact (`slug`, `lang`) match,
 * 2. monolingual entry (no `lang` filter — for pages that share a single
 *    file across locales, e.g. `now.md`),
 * 3. fallback to the Spanish copy so pages never 404 when only the default
 *    locale exists.
 *
 * Returns `undefined` only when no copy at all is present. Pages can use
 * that to render a graceful placeholder during partial migrations (e.g.
 * `now.md` arriving from agent 04 after this branch lands).
 */
export async function getPage(
  slug: PageSlug,
  lang: Language,
): Promise<PageEntry | undefined> {
  const all = await getCollection("pages", ({ data }) => data.slug === slug);
  return (
    all.find((entry) => entry.data.lang === lang) ??
    all.find((entry) => entry.data.lang === "es") ??
    all[0]
  );
}
