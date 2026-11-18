/**
 * Schema.org JSON-LD builder.
 *
 * Every page emits exactly one `@graph`. Entities that appear on many pages
 * (`Person`, `WebSite`) are defined once with a stable `@id` and referenced
 * by id everywhere else, so search engines and answer engines resolve them
 * to a single knowledge-graph entity instead of several near-duplicates.
 */
import { hreflangCodes, type Language } from "./i18n";
import {
  AUTHOR_NAME,
  PERSON_ID,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  WEBSITE_ID,
} from "./site";

export type PageKind =
  | "home"
  | "about"
  | "collection"
  | "post"
  | "project"
  | "page";

type Node = Record<string, unknown>;

export interface GraphInput {
  kind: PageKind;
  /** Absolute canonical URL of the page. */
  url: string;
  title: string;
  description: string;
  language: Language;
  /** Absolute image URL. */
  image: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  /** Project pages: display name and live URL of the application. */
  appName?: string;
  appUrl?: string;
}

const personRef = { "@id": PERSON_ID };
const websiteRef = { "@id": WEBSITE_ID };

function person(): Node {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: AUTHOR_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/og/default.png`,
    jobTitle: "Software Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Embat",
      url: "https://www.embat.com",
    },
    homeLocation: { "@type": "Place", name: "Madrid, Spain" },
    sameAs: SOCIAL_PROFILES,
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Astro",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Machine Learning",
      "LLMs",
      "IoT",
      "Web Development",
      "Agile",
    ],
  };
}

function website(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: Object.values(hreflangCodes),
    publisher: personRef,
  };
}

function imageObject(input: GraphInput): Node {
  return {
    "@type": "ImageObject",
    url: input.image,
    width: 1200,
    height: 630,
    ...(input.imageAlt ? { caption: input.imageAlt } : {}),
  };
}

function breadcrumbs(
  input: GraphInput,
  section: { name: string; path: string },
): Node {
  const prefix = input.language === "en" ? "/en" : "";
  const items = [
    {
      name: input.language === "en" ? "Home" : "Inicio",
      item: `${SITE_URL}${prefix}/`,
    },
    { name: section.name, item: `${SITE_URL}${prefix}${section.path}` },
    { name: input.appName ?? input.title, item: input.url },
  ];
  return {
    "@type": "BreadcrumbList",
    "@id": `${input.url}#breadcrumb`,
    itemListElement: items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

/** Fields shared by every `WebPage` subtype. */
function webPage(input: GraphInput, type: string): Node {
  return {
    "@type": type,
    "@id": `${input.url}#webpage`,
    url: input.url,
    name: input.title,
    description: input.description,
    inLanguage: hreflangCodes[input.language],
    isPartOf: websiteRef,
    primaryImageOfPage: imageObject(input),
  };
}

function pageNodes(input: GraphInput): Node[] {
  switch (input.kind) {
    case "home":
      return [{ ...webPage(input, "WebPage"), about: personRef }];

    case "about":
      return [{ ...webPage(input, "ProfilePage"), mainEntity: personRef }];

    case "collection":
      return [webPage(input, "CollectionPage")];

    case "post": {
      const crumbs = breadcrumbs(input, { name: "Blog", path: "/blog/" });
      return [
        { ...webPage(input, "WebPage"), breadcrumb: { "@id": crumbs["@id"] } },
        {
          "@type": "BlogPosting",
          "@id": `${input.url}#article`,
          headline: input.title,
          description: input.description,
          image: imageObject(input),
          inLanguage: hreflangCodes[input.language],
          ...(input.publishedTime
            ? {
                datePublished: input.publishedTime,
                dateModified: input.modifiedTime ?? input.publishedTime,
              }
            : {}),
          ...(input.keywords?.length
            ? { keywords: input.keywords.join(", ") }
            : {}),
          author: personRef,
          publisher: personRef,
          isPartOf: websiteRef,
          mainEntityOfPage: { "@id": `${input.url}#webpage` },
        },
        crumbs,
      ];
    }

    case "project": {
      const crumbs = breadcrumbs(input, {
        name: input.language === "en" ? "Projects" : "Proyectos",
        path: "/projects/",
      });
      return [
        { ...webPage(input, "WebPage"), breadcrumb: { "@id": crumbs["@id"] } },
        {
          "@type": "SoftwareApplication",
          "@id": `${input.url}#app`,
          name: input.appName ?? input.title,
          description: input.description,
          url: input.appUrl ?? input.url,
          applicationCategory: "WebApplication",
          operatingSystem: "Web",
          image: input.image,
          inLanguage: hreflangCodes[input.language],
          ...(input.publishedTime
            ? { datePublished: input.publishedTime }
            : {}),
          ...(input.keywords?.length
            ? { keywords: input.keywords.join(", ") }
            : {}),
          author: personRef,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          mainEntityOfPage: { "@id": `${input.url}#webpage` },
        },
        crumbs,
      ];
    }

    default:
      return [webPage(input, "WebPage")];
  }
}

/** The complete JSON-LD document for a page. */
export function buildGraph(input: GraphInput): Node {
  return {
    "@context": "https://schema.org",
    "@graph": [person(), website(), ...pageNodes(input)],
  };
}

/**
 * Index pages (`/blog`, `/projects`, `/tags`, `/tags/<slug>` and their
 * `/en` mirrors) are collections; pages don't have to say so explicitly.
 */
export function isCollectionPath(pathname: string): boolean {
  return /^\/(en\/)?(blog|projects|tags)\/?$/.test(pathname) ||
    /^\/(en\/)?tags\/[^/]+\/?$/.test(pathname);
}
