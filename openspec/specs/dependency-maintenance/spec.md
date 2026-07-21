# dependency-maintenance Specification

## Purpose

Define how project dependencies are upgraded, resolved, security-reviewed, and validated while preserving application behavior.

## Requirements

### Requirement: Compatible direct dependency baseline
The project SHALL evaluate every direct runtime and development dependency for upgrade to the latest release compatible with the pinned Node.js runtime and the selected peer-dependency graph. Any direct dependency not advanced to that release MUST have its blocking constraint and follow-up recorded.

#### Scenario: Compatible release is available
- **WHEN** a newer direct dependency release supports Node.js 22 and the selected ecosystem peer versions
- **THEN** the manifest SHALL select that release using the repository's existing version-range convention

#### Scenario: Latest release is incompatible
- **WHEN** the newest direct dependency release conflicts with Node.js 22 or a required peer dependency
- **THEN** the project SHALL select the newest mutually compatible release and record the reason the newer release was deferred

### Requirement: Reproducible dependency resolution
The project SHALL regenerate `pnpm-lock.yaml` through pnpm after manifest changes and SHALL maintain a dependency graph that installs successfully from the lockfile without unresolved peer-dependency errors.

#### Scenario: Clean frozen installation
- **WHEN** dependencies are installed in a clean environment using the frozen lockfile
- **THEN** pnpm SHALL install the exact reviewed dependency graph without changing the manifest or lockfile

### Requirement: Explicit override and security review
The project SHALL re-evaluate package overrides and known dependency vulnerabilities after resolving the updated graph. An override SHALL remain only when its purpose and compatibility are still valid, and unresolved high- or critical-severity findings MUST be documented with a mitigation or follow-up.

#### Scenario: Existing override is no longer required
- **WHEN** the refreshed dependency graph no longer needs the `semver` override
- **THEN** the override SHALL be removed from the manifest and lockfile resolution

#### Scenario: Material vulnerability remains
- **WHEN** the final dependency audit reports a high- or critical-severity issue that cannot be resolved within the compatible graph
- **THEN** the change SHALL record the affected package, exposure, mitigation, and follow-up action

### Requirement: Preserved application behavior
The upgraded dependency graph and required migrations SHALL preserve the site's existing routes, rendered content, styling, and supported production build targets.

#### Scenario: Upgrade validation succeeds
- **WHEN** the final dependency manifest, lockfile, configuration, and source migrations are tested
- **THEN** Astro static checks, the standard production build, the Node-adapter production build, and the Playwright suite SHALL complete successfully
