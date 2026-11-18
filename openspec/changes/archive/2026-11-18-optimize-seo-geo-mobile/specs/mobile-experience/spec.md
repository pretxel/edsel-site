## ADDED Requirements

### Requirement: Hero animation on mobile
The home page hero SHALL display its animated particle visual on viewports narrower than 768px as well as on larger viewports, in both languages.

#### Scenario: Phone viewport shows animation
- **WHEN** `/` is loaded on a 390×844 viewport with default motion settings
- **THEN** an animated hero canvas becomes visible behind the hero copy

#### Scenario: Desktop unchanged
- **WHEN** `/` is loaded on a 1280×800 viewport
- **THEN** the hero animation renders as it did before this change

### Requirement: Animation does not block mobile rendering
On mobile the hero animation code SHALL load only after the page's load event and during idle time, SHALL NOT be the LCP element, and SHALL NOT cause layout shift when it mounts. The animation SHALL pause while the hero is offscreen or the tab is hidden.

#### Scenario: Hero text paints first
- **WHEN** `/` is loaded on a throttled mobile profile
- **THEN** the hero heading is visible before the animation script is requested

#### Scenario: No layout shift on mount
- **WHEN** the hero canvas mounts on mobile
- **THEN** the position and size of the hero heading and CTA do not change

#### Scenario: Offscreen pause
- **WHEN** the user scrolls the hero fully out of view
- **THEN** the animation stops rendering frames until the hero re-enters the viewport

### Requirement: Motion and data preferences respected
The site SHALL NOT mount the hero animation or run non-essential CSS animations when `prefers-reduced-motion: reduce` is set, and SHALL NOT load the hero animation when the browser reports data-saver mode.

#### Scenario: Reduced motion
- **WHEN** `/` is loaded with `prefers-reduced-motion: reduce`
- **THEN** no hero canvas is created and the static hero gradient is shown

#### Scenario: Data saver
- **WHEN** `/` is loaded on a device reporting `saveData`
- **THEN** the hero animation script is not requested

### Requirement: Responsive layout without overflow
Every route SHALL render without horizontal scrolling at viewport widths from 360px to 430px, and interactive controls in navigation, language switcher and primary CTAs SHALL have a tap target of at least 44×44 CSS pixels.

#### Scenario: No horizontal overflow
- **WHEN** any of `/`, `/projects`, `/projects/<slug>`, `/blog`, `/about` and their `/en` variants is loaded at 360px width
- **THEN** the document's scroll width does not exceed its client width

#### Scenario: Tap targets
- **WHEN** the language switcher and hero CTA are measured on a phone viewport
- **THEN** each is at least 44 CSS pixels in both dimensions

### Requirement: Interaction feedback on touch devices
Transitions and state feedback provided on hover for cards, links and buttons SHALL have an equivalent on touch and keyboard (`:active` or `:focus-visible`), so no animation is exclusive to pointer devices.

#### Scenario: Card feedback on touch
- **WHEN** a project card is pressed on a touch device
- **THEN** it shows the same transition feedback as desktop hover

### Requirement: Mobile quality budget
The home page and a project detail page SHALL meet, on a Lighthouse mobile run against a production build: Performance ≥ 90, SEO = 100, Accessibility ≥ 95, LCP ≤ 2.5 s and CLS ≤ 0.1.

#### Scenario: Budget verified after change
- **WHEN** Lighthouse mobile is run on `/` and `/projects/daily-potato` after implementation
- **THEN** all listed thresholds are met, or the hero animation falls back to a lighter implementation until they are
