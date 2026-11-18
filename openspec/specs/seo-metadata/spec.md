# seo-metadata Specification

## Purpose

Define the meta tags, canonical and hreflang links, social sharing metadata and Schema.org structured data every indexable page must emit.

## Requirements

### Requirement: Unique core meta tags per page
Every indexable HTML route SHALL render exactly one `<title>`, one `meta[name="description"]`, one `link[rel="canonical"]` with an absolute `https://www.edselserrano.com` URL, one `meta[name="viewport"]`, and one `meta[name="theme-color"]`. Pages MUST NOT emit `meta[name="keywords"]` or `meta[name="language"]`.

#### Scenario: Home page head is free of duplicates
- **WHEN** `/` is requested
- **THEN** the response HTML contains exactly one each of title, description, canonical, viewport and theme-color tags

#### Scenario: Static page uses the shared head pipeline
- **WHEN** `/about` or `/en/about` is requested
- **THEN** the page contains a canonical URL, Open Graph tags and Twitter Card tags produced by the same component used by the home page

#### Scenario: Non-indexable page
- **WHEN** a page is rendered with `noindex`
- **THEN** it emits `meta[name="robots"]` with `noindex, nofollow` and no hreflang alternates

### Requirement: Reciprocal hreflang alternates
Every page available in both languages SHALL emit `link[rel="alternate"]` entries for `es-ES`, `en-US` and `x-default`, where `x-default` points to the Spanish URL of the same page. The alternate set MUST be identical on both language variants and MUST match the alternates published in the sitemap.

#### Scenario: Project page alternates
- **WHEN** `/en/projects/qr-magic` is requested
- **THEN** it lists `es-ES` → `/projects/qr-magic`, `en-US` → `/en/projects/qr-magic` and `x-default` → `/projects/qr-magic`

#### Scenario: Reciprocity
- **WHEN** the Spanish and English variants of the same page are compared
- **THEN** both contain the same three hreflang URLs

#### Scenario: Single-language post
- **WHEN** a blog post exists in only one language
- **THEN** the page emits only a self-referencing hreflang for that language

### Requirement: Social sharing metadata
Every indexable page SHALL emit Open Graph (`og:type`, `og:title`, `og:description`, `og:url`, `og:image` with width, height and alt, `og:locale`) and Twitter Card (`summary_large_image`) tags, with absolute image URLs that resolve with HTTP 200.

#### Scenario: Project page share image
- **WHEN** a project detail page is requested
- **THEN** `og:image` and `twitter:image` reference an absolute URL that returns an image

### Requirement: Consolidated structured data graph
Every indexable page SHALL emit exactly one `application/ld+json` script containing a single `@graph`. The graph MUST define the `Person` entity `https://www.edselserrano.com/#edsel` at most once and every author or publisher reference MUST point to that `@id`. The page node type SHALL be `BlogPosting` for posts, `SoftwareApplication` for project detail pages, `ProfilePage` for about pages, `CollectionPage` for index pages and `WebPage` otherwise. Post and project detail pages SHALL include a `BreadcrumbList`.

#### Scenario: Valid JSON-LD
- **WHEN** any indexable page is requested
- **THEN** its JSON-LD script parses as JSON and contains `@context` `https://schema.org` and a non-empty `@graph`

#### Scenario: Single Person definition
- **WHEN** a blog post page is requested
- **THEN** the graph contains one `Person` node with `@id` ending in `#edsel` and the `BlogPosting.author` references that `@id`

#### Scenario: Project page type
- **WHEN** `/projects/daily-potato` is requested
- **THEN** the graph contains a `SoftwareApplication` node and a `BreadcrumbList` with the project as last item

### Requirement: Build-safe font preload
Any font preload link SHALL reference the same URL the stylesheet's `@font-face` uses for that font, resolved at build time rather than by a hardcoded hashed filename.

#### Scenario: Preload matches emitted asset
- **WHEN** the site is built and the home page is requested
- **THEN** the `link[rel="preload"][as="font"]` href returns HTTP 200 and the font is downloaded only once
