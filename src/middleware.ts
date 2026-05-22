import { defineMiddleware } from "astro:middleware";

/**
 * Auto-redirect anonymous visitors landing on `/` to the language that
 * matches their browser preferences (Accept-Language header). After the
 * first detection — or after a manual click on the language switcher —
 * the chosen language is stored in a long-lived `lang` cookie, so we
 * never re-redirect that visitor again.
 *
 * Manual selection is signalled with `?lang=es` or `?lang=en` on the
 * destination URL. We persist the cookie and 302 to the clean URL so the
 * query parameter doesn't pollute address bars or analytics.
 */
const COOKIE_NAME = "lang";
const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // 1. Honor explicit `?lang=` overrides — sticky-set the cookie and
  //    strip the query so subsequent links stay clean.
  const queryLang = url.searchParams.get(COOKIE_NAME);
  if (queryLang === "es" || queryLang === "en") {
    context.cookies.set(COOKIE_NAME, queryLang, COOKIE_OPTIONS);
    url.searchParams.delete(COOKIE_NAME);
    const cleanUrl = url.pathname + (url.search ? url.search : "");
    return context.redirect(cleanUrl, 302);
  }

  // 2. First-time visitor on the Spanish home — sniff Accept-Language.
  if (url.pathname === "/" && !context.cookies.has(COOKIE_NAME)) {
    const accept = context.request.headers.get("accept-language") ?? "";
    const prefersEnglish = preferenceFromAcceptLanguage(accept) === "en";
    context.cookies.set(
      COOKIE_NAME,
      prefersEnglish ? "en" : "es",
      COOKIE_OPTIONS,
    );
    if (prefersEnglish) {
      return context.redirect("/en/", 302);
    }
  }

  // 3. Anonymous visitor landing directly on /en/* — record the
  //    implicit choice so we don't second-guess them later.
  if (
    (url.pathname === "/en" || url.pathname === "/en/") &&
    !context.cookies.has(COOKIE_NAME)
  ) {
    context.cookies.set(COOKIE_NAME, "en", COOKIE_OPTIONS);
  }

  return next();
});

/**
 * Parse the Accept-Language header and pick the highest-priority tag
 * whose base language is `es` or `en`. Defaults to `es` (site default)
 * when neither is mentioned.
 */
function preferenceFromAcceptLanguage(header: string): "es" | "en" {
  const items = header
    .split(",")
    .map((part) => {
      const [rawTag, ...rest] = part.trim().split(";");
      if (!rawTag) return null;
      const qPart = rest.find((p) => p.trim().startsWith("q="));
      const q = qPart ? Number.parseFloat(qPart.trim().slice(2)) : 1;
      return {
        tag: rawTag.toLowerCase(),
        q: Number.isFinite(q) ? q : 1,
      };
    })
    .filter((entry): entry is { tag: string; q: number } => entry !== null)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of items) {
    const base = tag.split("-")[0];
    if (base === "es") return "es";
    if (base === "en") return "en";
  }
  return "es";
}
