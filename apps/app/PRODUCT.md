# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Angular developers evaluating or already using xUI. Primary situation: landing on xuijs.org from
GitHub, npm or a search, deciding within a minute whether the library is worth installing, then
moving into the docs to wire it up. A secondary audience is coding agents (via the MCP server and
agent skill) and the developers who point them at the library.

## Product Purpose

xuijs.org is the documentation and marketing site for xUI, an Angular 22 component library styled
with Tailwind CSS 4 and published as ~90 `@xui/<name>` packages on top of headless `@xui/core/*`
entrypoints. The site exists to convert a curious developer into an installed workspace
(`ng add @xui/core`) and to document every package's real API. Success on the landing page is a
click through to Getting started or Components.

## Positioning

One npm package per component, all themed from a single semantic token layer, so light and dark
are one CSS variable rather than a fork of `dark:` classes. The catalogue goes past primitives:
data tables, dock manager, omnibar, node graph and date ranges are packages, not exercises left to
the reader. Every visual axis is a typed CVA variant whose `class` input merges through
tailwind-merge. An MCP server exposes the real API of every package, extracted from the sources.

## Operating Context

- Site: Angular SSR/prerendered app at `apps/app`, deployed on Netlify at https://xuijs.org.
- Routes: `/` (landing), `/docs/getting-started`, `/docs/theming`, `/docs/theme-builder`,
  `/docs/ai-agents`, `/docs/components`, `/docs/components/:slug`.
- Component data comes from `apps/app/src/generated/manifest.ts` (COMPONENTS, GROUPS, VERSION),
  regenerated from the library sources; the landing page reads counts from it rather than hardcoding.
- The docs site uses the library's own tokens (`libs/core/styles/theme.css`) and a light/dark toggle
  persisted in `localStorage['xui-docs-theme']`, applied before first paint from `index.html`.
- Storybook (Chromatic) and a StackBlitz fork exist as external demos.

## Capabilities and Constraints

- Angular 22, zoneless, `OnPush`, signal inputs; Tailwind 4 with the xUI token layer.
- The landing page must be built from `@xui/*` packages where a package fits; the page is itself a
  demonstration of the library.
- Landing page decision (2026-09-17): pinned to a black theme regardless of the site toggle; `/docs`
  keeps the toggle. Live `@xui/*` components stand in for product screenshots. The shared header and
  footer are restyled on the landing page only.
- Everything must prerender: no client-only content in the first viewport.
- Apache 2.0 licensed, free; there is no pricing, no paid tier.

## Brand Commitments

- Name: xUI. Logo mark is the wordmark with a primary-coloured "x".
- Voice: plain, technical, specific. Claims are about mechanisms (tokens, packages, signals), not
  superlatives.
- Primary intent colour: `oklch(55.88% 0.154 252.84)` (blue).
- Visual reference the user made binding for the landing page: https://www.eagle.cool/ (black
  ground, gradient display headlines, translucent 24px-radius cards, product showcased inside the
  cards).

## Evidence on Hand

- ~90 components with real docs and live previews under `/docs/components`.
- README feature list and code samples at the repo root.
- No testimonials, customer logos, download counts or benchmarks are on hand; do not fabricate them.

## Product Principles

1. The page is the demo: show the actual components running, not pictures of them.
2. Numbers come from the manifest; copy makes mechanical claims that the code can back up.
3. Every state is a token away: the landing page proves theming by using the token layer itself.
4. Fast path to `ng add`: one primary action, visible without scrolling.
5. Agent-friendly is a feature, not a footnote.

## Accessibility & Inclusion

WCAG 2.1 AA target: contrast on the black ground, keyboard-reachable showcase demos, reduced-motion
respected for any decorative motion.
