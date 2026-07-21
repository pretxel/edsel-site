## 1. Establish the Upgrade Baseline

- [x] 1.1 Confirm the active Node.js and pnpm versions, inventory outdated direct dependencies, and capture the current dependency audit results.
- [x] 1.2 Run the current Astro check, standard build, Node-adapter build, and Playwright suite to distinguish pre-existing failures from upgrade regressions.
- [x] 1.3 Review release and migration guidance for available major upgrades, group framework-coupled packages, and record any version intentionally held for Node.js or peer compatibility.

## 2. Refresh Dependency Resolution

- [x] 2.1 Update every compatible direct runtime and development dependency in `package.json`, keeping `@types/node` aligned with the pinned Node.js 22 runtime.
- [x] 2.2 Re-evaluate the `semver` override against the selected graph and remove, update, or explicitly justify it.
- [x] 2.3 Regenerate `pnpm-lock.yaml` with pnpm and resolve all unsupported engine or peer-dependency errors.
- [x] 2.4 Review manifest and lockfile diffs for the expected importer versions and material transitive changes.

## 3. Apply Required Migrations

- [x] 3.1 Update Astro, React, Tailwind CSS, TypeScript, adapter, or tooling configuration only where required by selected package releases.
- [x] 3.2 Update application code and tests for changed package APIs or defaults while preserving existing routes, rendered content, and styling.

## 4. Verify the Updated Project

- [x] 4.1 Verify the reviewed manifest and lockfile install successfully with `pnpm install --frozen-lockfile` and do not change during installation.
- [x] 4.2 Run `pnpm exec astro check` and resolve all upgrade-related diagnostics.
- [x] 4.3 Run `pnpm run build` and `pnpm run build:node` and resolve all upgrade-related production build failures.
- [x] 4.4 Run `pnpm test` and resolve all upgrade-related browser regressions.
- [x] 4.5 Run the final dependency audit, remediate high- or critical-severity findings where compatible fixes exist, and document any remaining exception with its mitigation and follow-up.
- [x] 4.6 Review the final working-tree diff and exclude generated or unrelated files from the dependency update.
