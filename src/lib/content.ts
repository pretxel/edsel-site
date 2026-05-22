import { getCollection, type CollectionEntry } from "astro:content";
import { colors } from "./colors";
import type { Language } from "./i18n";

export type ProjectEntry = CollectionEntry<"projects">;
export type PostEntry = CollectionEntry<"posts">;
export type PageEntry = CollectionEntry<"pages">;

export type PageKind = "about";

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
 * Find a single post by its content-collection id (file basename).
 */
export async function getPostBySlug(
  slug: string,
): Promise<PostEntry | undefined> {
  const all = await getCollection("posts", ({ data }) => !data.draft);
  return all.find((entry) => entry.id === slug);
}

/**
 * Related posts: same lang, intersect tags, sorted by shared-tag count
 * desc then date desc. Falls back to most recent posts when there is no
 * overlap so the section never renders empty for a post with content.
 */
export async function getRelatedPosts(
  current: PostEntry,
  limit = 3,
): Promise<PostEntry[]> {
  const all = await getAllPosts(current.data.lang);
  const others = all.filter((p) => p.id !== current.id);
  const tags = new Set(current.data.tags);

  const scored = others
    .map((p) => ({
      entry: p,
      shared: p.data.tags.filter((t) => tags.has(t)).length,
    }))
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return b.entry.data.date.getTime() - a.entry.data.date.getTime();
    });

  return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Related projects to a given project: intersect tags, drop self, top N.
 */
export async function getRelatedProjects(
  current: ProjectEntry,
  lang: Language,
  limit = 3,
): Promise<LocalizedProject[]> {
  const all = await getLocalizedProjects(lang);
  const others = all.filter((p) => p.slug !== current.id);
  const tags = new Set(current.data.tags);

  const scored = others
    .map((p) => ({
      project: p,
      shared: p.tags.filter((t) => tags.has(t)).length,
    }))
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return b.project.pubDate.getTime() - a.project.pubDate.getTime();
    });

  return scored.slice(0, limit).map((s) => s.project);
}

/**
 * Union of all tags currently in use across posts + projects for a given lang.
 */
export async function getAllTags(lang: Language): Promise<string[]> {
  const projects = await getLocalizedProjects(lang);
  const posts = await getAllPosts(lang);

  const set = new Map<string, string>();
  const { slugifyTag } = await import("./tags");
  const push = (tag: string) => {
    const slug = slugifyTag(tag);
    if (!set.has(slug)) set.set(slug, tag);
  };
  projects.forEach((p) => p.tags.forEach(push));
  posts.forEach((p) => p.data.tags.forEach(push));
  return Array.from(set.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
}

/**
 * Items (posts + projects) carrying a given tag slug for a language.
 */
export async function getItemsByTagSlug(
  tagSlug: string,
  lang: Language,
): Promise<{
  posts: PostEntry[];
  projects: LocalizedProject[];
  canonicalLabel: string | null;
}> {
  const { slugifyTag } = await import("./tags");
  const allPosts = await getAllPosts(lang);
  const allProjects = await getLocalizedProjects(lang);

  const posts = allPosts.filter((p) =>
    p.data.tags.some((t) => slugifyTag(t) === tagSlug),
  );
  const projects = allProjects.filter((p) =>
    p.tags.some((t) => slugifyTag(t) === tagSlug),
  );

  const firstTag =
    posts.flatMap((p) => p.data.tags).find((t) => slugifyTag(t) === tagSlug) ??
    projects.flatMap((p) => p.tags).find((t) => slugifyTag(t) === tagSlug) ??
    null;

  return { posts, projects, canonicalLabel: firstTag };
}

/**
 * Look up an evergreen page (`/about`) for a given language.
 */
export async function getPage(
  kind: PageKind,
  lang: Language,
): Promise<PageEntry | undefined> {
  const all = await getCollection("pages", ({ data }) => data.kind === kind);
  return (
    all.find((entry) => entry.data.lang === lang) ??
    all.find((entry) => entry.data.lang === "es") ??
    all[0]
  );
}
