/**
 * Tag slug + label utilities.
 *
 * Slug rule: lowercase, replace runs of non-alphanumerics with `-`, trim.
 * Examples: `"Next.js"` → `"next-js"`, `"TypeScript"` → `"typescript"`,
 * `"Tailwind CSS"` → `"tailwind-css"`.
 *
 * The choice (kebab over compact `nextjs`) is intentional: kebab is reversible
 * for humans skimming URLs and consistent across tags that have multiple
 * non-alphanumeric separators.
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Build a `/tags/<slug>` URL respecting current language. */
export function tagUrl(tag: string, lang: "es" | "en"): string {
  const slug = slugifyTag(tag);
  return lang === "en" ? `/en/tags/${slug}` : `/tags/${slug}`;
}
