# llm-discoverability Specification

## Purpose

Define how the site exposes its content to LLM crawlers and answer engines: generated llms.txt and llms-full.txt, per-page Markdown alternates, the AI-crawler robots policy and truthful sitemap freshness.

## Requirements

### Requirement: Generated llms.txt index
The site SHALL serve `/llms.txt` generated from the content collections, following the llmstxt.org structure: an H1 with the site name, a blockquote summary, and `##` sections listing core pages, every project and every published post with a one-line description. No static copy of the file SHALL exist in `public/`.

#### Scenario: New project appears automatically
- **WHEN** a project MDX file is added to the projects collection and the site is deployed
- **THEN** `/llms.txt` lists that project with its description without manual edits

#### Scenario: Drafts excluded
- **WHEN** a post has `draft: true`
- **THEN** it does not appear in `/llms.txt` or `/llms-full.txt`

#### Scenario: Response format
- **WHEN** `/llms.txt` is requested
- **THEN** the response is HTTP 200 with a UTF-8 Markdown or plain-text content type and begins with `# Edsel Serrano`

### Requirement: Full-content dump covers all content types
`/llms-full.txt` SHALL include the about page, every project and every published post, in both Spanish and English where available, each preceded by its title and canonical URL.

#### Scenario: Posts included
- **WHEN** at least one published post exists
- **THEN** `/llms-full.txt` contains that post's title, canonical URL and body

#### Scenario: Bilingual project content
- **WHEN** `/llms-full.txt` is requested
- **THEN** each project appears with both its Spanish and English write-up

### Requirement: Markdown alternates for content pages
Each project detail page and each published post SHALL have a Markdown representation at the page URL suffixed with `.md`, containing the title, description, canonical URL, tags and the language-specific body. The HTML page SHALL advertise it via `link[rel="alternate"][type="text/markdown"]`, and the Markdown response SHALL carry `X-Robots-Tag: noindex`.

#### Scenario: Fetching a project as Markdown
- **WHEN** `/en/projects/qr-magic.md` is requested
- **THEN** the response is HTTP 200, `text/markdown`, contains the English write-up only, and includes the `X-Robots-Tag: noindex` header

#### Scenario: Alternate link advertised
- **WHEN** `/projects/qr-magic` is requested
- **THEN** its head contains a `text/markdown` alternate link pointing to `/projects/qr-magic.md`

#### Scenario: Unknown slug
- **WHEN** a `.md` URL for a non-existent slug is requested
- **THEN** the response is HTTP 404

### Requirement: AI crawler access policy
`/robots.txt` SHALL explicitly allow current search and AI crawlers (including GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended), SHALL reference the sitemap index, and MUST NOT contain the non-standard `Host` directive or user agents that have been retired by their vendors. The file SHALL have a single source in the repository.

#### Scenario: Current Anthropic agents allowed
- **WHEN** `/robots.txt` is requested
- **THEN** it contains allow rules for `ClaudeBot`, `Claude-SearchBot` and `Claude-User` and no rule for `Claude-Web` or `anthropic-ai`

#### Scenario: Sitemap referenced
- **WHEN** `/robots.txt` is requested
- **THEN** it contains `Sitemap: https://www.edselserrano.com/sitemap-index.xml`

### Requirement: Truthful sitemap freshness
Each sitemap URL's `lastmod` SHALL derive from the underlying content's date or updated date; index pages SHALL use the most recent date among the entries they list. `lastmod` MUST NOT be set to the request or build date.

#### Scenario: Project lastmod
- **WHEN** `/sitemap.xml` is requested
- **THEN** the entry for a project carries a `lastmod` equal to that project's content date

#### Scenario: Stable across requests
- **WHEN** `/sitemap.xml` is requested on two different days with no content change
- **THEN** all `lastmod` values are identical
