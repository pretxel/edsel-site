## Context

The site is a single-package pnpm project built with Astro 6, React 19, Tailwind CSS 4, TypeScript 6, Playwright, and deployment adapters for Node and Vercel. Dependency declarations live in `package.json`, resolved versions live in the pnpm v9 lockfile, and Volta pins Node.js 22.19.0. Because framework packages, adapters, integrations, types, and build plugins have peer-dependency relationships, they must be upgraded and validated as a coordinated set.

## Goals / Non-Goals

**Goals:**

- Bring each direct dependency to the newest release that is compatible with Node.js 22 and the rest of the selected dependency graph.
- Produce a reproducible pnpm lockfile without unresolved peer-dependency conflicts.
- Make the smallest configuration or source migrations needed for the upgraded packages.
- Preserve existing site behavior and verify static analysis, production builds, and browser tests.
- Identify and either remediate or explicitly document dependency security exceptions.

**Non-Goals:**

- Changing the site's features, routes, content, visual design, or public API.
- Replacing pnpm, Astro, React, Tailwind CSS, or the deployment platform.
- Refactoring unrelated application code or adding dependencies without an upgrade-driven need.
- Moving away from the pinned Node.js 22 runtime as part of this change.

## Decisions

### Use runtime and peer compatibility as the upgrade boundary

Inventory direct packages with pnpm, then select the latest published versions that support the pinned Node.js 22 runtime and form a valid peer-dependency graph. Framework-coupled packages—Astro, its adapters and integrations, React, Tailwind CSS, and their related types/plugins—will be evaluated together rather than upgraded independently. `@types/node` will track the Node.js 22 runtime instead of advancing to a newer Node major merely because one is available.

The alternative is to accept every newest version unconditionally. That would allow a dependency refresh to silently require a runtime migration and could produce an unsupported combination of framework integrations.

### Let pnpm regenerate resolution metadata

Update direct ranges in `package.json` and regenerate `pnpm-lock.yaml` with the repository's package manager. Do not hand-edit resolved lockfile entries. Verify the result with a frozen-lockfile install so CI and clean environments resolve exactly the reviewed graph.

The alternative is to update only manifest ranges or manually adjust lockfile entries; neither proves that the repository can be installed reproducibly.

### Audit overrides and exceptions explicitly

Re-evaluate the existing `semver` override against the refreshed dependency tree and current security guidance. Remove it if upstream constraints no longer require it; otherwise update or retain it only with a recorded reason. Any direct package held below the newest release, or any unresolved high/critical audit finding, must be documented with its blocker and follow-up.

The alternative is to preserve overrides and skipped upgrades automatically, which can mask stale constraints and security exposure.

### Keep migrations scoped and validate at user-visible boundaries

Apply only changes required by upstream release notes, type errors, build failures, or tests. Validation will cover Astro checks, both configured production build modes, and Playwright tests, followed by a review that generated artifacts are not accidentally committed.

The alternative is to combine dependency upgrades with opportunistic refactors, which would increase the regression surface and make failures harder to attribute.

## Risks / Trade-offs

- [Major releases introduce incompatible APIs or defaults] → Review migration guidance for every selected major upgrade and keep source changes narrowly tied to those migrations.
- [Peer ranges temporarily prevent using the newest package] → Prefer a mutually supported ecosystem set and document any intentionally deferred package with its blocking peer constraint.
- [Lockfile churn obscures an unexpected transitive change] → Review importer changes and material transitive shifts, then confirm with a clean frozen install.
- [Browser tests miss adapter-specific failures] → Run the standard Astro build and the Node-adapter build in addition to Playwright.
- [A forced transitive override becomes unsafe or unnecessary] → Inspect why the override exists and remove or revise it based on the resolved graph and audit result.

## Migration Plan

1. Capture the current outdated and audit reports and establish that the existing verification commands run in the pinned Node environment.
2. Select compatible package versions, updating framework-coupled packages as a group and documenting intentional holds.
3. Regenerate the pnpm lockfile and inspect peer warnings, override effects, and importer changes.
4. Apply required configuration, source, and test migrations from upstream guidance.
5. Run a frozen install, Astro static checks, both production builds, Playwright tests, and the final audit review.
6. If validation cannot be restored, revert the manifest, lockfile, and upgrade-driven migrations together; deployment is not required for this change.

## Open Questions

None. Compatibility findings discovered during implementation will be resolved using the constraints above or recorded as explicit deferred upgrades.

## Implementation Findings

- Upgrade Astro and its official integrations together to Astro 7.1.3, `@astrojs/react` 6.0.1, `@astrojs/mdx` 7.0.3, `@astrojs/node` 11.0.2, and `@astrojs/vercel` 11.0.3. Their published requirements support the pinned Node.js 22.19.0 runtime, and the project does not use the experimental flags removed by Astro 7. The migration must still verify the Vite 8-backed Tailwind plugin and both adapters.
- Hold TypeScript at 6.0.3. TypeScript 7.0 does not yet expose the stable programmatic API required by embedded-language tooling, and the TypeScript team explicitly recommends that Astro and MDX projects remain on TypeScript 6 for now. Follow up when Astro's language tooling announces TypeScript 7 support.
- Replace `@types/node` 25.x with the latest Node 22 line so editor and build declarations match the deployed runtime rather than an unrelated newer major.
- Upgrade the remaining outdated direct packages to their current releases. The Tailwind CSS 4.3.3 Vite plugin accepts Vite 8, and `prettier-plugin-tailwindcss` 0.8.1 supports the project's Node and Prettier 3 versions.
- Keep a targeted pnpm override from `astro-compress` to SVGO 4.0.2. `astro-compress` 2.4.1 pins vulnerable SVGO 4.0.1 exactly; 4.0.2 is the upstream security patch in the same major and is already used by Astro 7. Remove the override after `astro-compress` publishes a release using SVGO 4.0.2 or newer.
