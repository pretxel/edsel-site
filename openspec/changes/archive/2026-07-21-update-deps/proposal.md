## Why

The project dependencies and lockfile need a coordinated refresh so the site remains supported, secure, and compatible with the current Astro, React, Tailwind CSS, TypeScript, and Node.js ecosystem. Updating them together also makes migration issues visible now instead of allowing compatibility debt to accumulate.

## What Changes

- Update all direct runtime and development dependencies in `package.json` to their latest compatible releases.
- Re-resolve transitive dependencies and regenerate `pnpm-lock.yaml`, retaining an override only when it is still required and compatible.
- Adapt project configuration and source code for any upstream breaking changes introduced by the selected releases.
- Validate the refreshed dependency graph with install consistency checks, static checks, the production build, and the existing Playwright test suite.
- Record any dependency that cannot be upgraded, including the compatibility constraint and follow-up required.

## Capabilities

### New Capabilities

- `dependency-maintenance`: Defines the requirements for safely refreshing project dependencies while preserving application behavior and reproducible installs.

### Modified Capabilities

None.

## Impact

This change affects `package.json`, `pnpm-lock.yaml`, package-manager resolution, and potentially Astro configuration, TypeScript/React code, styling configuration, tests, and build tooling where upstream APIs have changed. The deployed site's intended user-facing behavior and public URLs remain unchanged.
