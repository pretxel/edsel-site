/**
 * Site-wide constants shared by the head components, structured data,
 * sitemap and LLM endpoints. Keep the origin here so every absolute URL the
 * site emits agrees on host and protocol.
 */
export const SITE_URL = "https://www.edselserrano.com";
export const SITE_NAME = "Edsel Serrano";
export const AUTHOR_NAME = "Edsel Serrano";

/** Stable Schema.org node identifiers. */
export const PERSON_ID = `${SITE_URL}/#edsel`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const SOCIAL_PROFILES = [
  "https://github.com/pretxel",
  "https://www.linkedin.com/in/edselserrano",
  "https://twitter.com/edselserrano",
];

/** Absolute URL for a site-relative path (absolute URLs pass through). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
