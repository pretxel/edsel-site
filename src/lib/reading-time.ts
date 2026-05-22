/**
 * Reading time estimator.
 *
 * Average sustained reading speed is ~220 wpm for English / Spanish.
 * `body` arrives from Astro Content Collections as raw MDX/Markdown; we strip
 * frontmatter, code fences, and tags before counting words so technical posts
 * don't get penalized by snippets the reader skims.
 *
 * Always returns at least 1 minute — anything shorter rounds to 1.
 */
const WPM = 220;

/** Strip frontmatter / fenced code / inline tags so word count is meaningful. */
function normalize(text: string): string {
  return text
    // strip YAML / TOML frontmatter
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/^\+\+\+[\s\S]*?\+\+\+\n/, "")
    // strip fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // strip inline code
    .replace(/`[^`]*`/g, " ")
    // strip HTML / JSX tags (keep their inner text out of the way)
    .replace(/<[^>]+>/g, " ")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Estimated reading time in whole minutes, clamped to a minimum of 1.
 */
export function readingTime(text: string): number {
  if (!text) return 1;
  const clean = normalize(text);
  if (!clean) return 1;
  const words = clean.split(/\s+/).length;
  return Math.max(1, Math.round(words / WPM));
}

/**
 * Word count helper — handy for OG image footers or analytics.
 */
export function wordCount(text: string): number {
  if (!text) return 0;
  const clean = normalize(text);
  return clean ? clean.split(/\s+/).length : 0;
}
