<h1 align="center">xUI</h1>

<p align="center">
  <strong>90 Angular components, one npm package each, themed from a single token layer.</strong>
</p>

<p align="center">
  <a href="https://xuijs.org">Documentation</a> ·
  <a href="https://develop--67d2b4c756077a325913e5d9.chromatic.com/?globals=theme:dark">Storybook</a> ·
  <a href="https://stackblitz.com/fork/xui">StackBlitz</a> ·
  <a href="#components">Components</a>
</p>

<p align="center">
  <a href="https://github.com/rikarin/xui/actions/workflows/release.yml"><img src="https://github.com/rikarin/xui/actions/workflows/release.yml/badge.svg?branch=master" alt="Build status" /></a>
  <a href="https://www.npmjs.com/package/@xui/core"><img src="https://img.shields.io/npm/v/%40xui/core.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/org/xui"><img src="https://img.shields.io/npm/dm/%40xui/core.svg" alt="Downloads" /></a>
  <a href="https://app.netlify.com/sites/xui/deploys"><img src="https://api.netlify.com/api/v1/badges/fa0cfd14-97df-47fa-8a7c-152e6d4cfda2/deploy-status" alt="Netlify status" /></a>
</p>

---

xUI is an Angular 22 component library styled with Tailwind CSS 4. You compose it from directives and
standalone components rather than configuring one monolith, and the set goes well past the
primitives: data tables, dock managers, omnibars, node graphs and date ranges are packages here, not
things you are left to build.

```ts
import { XuiButtonImports } from '@xui/button';

@Component({
  imports: [XuiButtonImports],
  template: `<button xuiButton color="primary">Save changes</button>`
})
export class Example {}
```

## Features

- **One package per component.** Install `@xui/button` and you ship a button, not a library. Each
  package exports an imports barrel for standalone components.
- **Signals throughout.** Signal inputs, `OnPush` and zoneless change detection; no `zone.js`
  required.
- **Themed by tokens, not overrides.** Components style themselves with `bg-surface`,
  `text-foreground-muted`, `border-error-muted`. Light and dark both work without a single `dark:`
  class, and re-colouring an intent is one CSS variable.
- **Typed variants.** Every visual axis is a typed input backed by
  [CVA](https://cva.style), and the `class` input merges through `tailwind-merge` — your utility
  wins instead of fighting the component's.
- **Angular CDK underneath.** Overlays, focus traps, roving tabindex, typeahead, drag and drop and
  bidi come from `@angular/cdk`, so keyboard behaviour and RTL are not reimplemented per component.
- **Built for coding agents.** An MCP server and an agent skill expose the real API of every
  package — see [AI coding agents](#ai-coding-agents).

## Requirements

|                         |     |
| ----------------------- | --- |
| Angular                 | 22  |
| Tailwind CSS            | 4   |
| Node (development only) | 24  |

## Getting started

```bash
ng add @xui/core
```

That installs the core package and wires your global stylesheet: the theme import, the CDK overlay
stylesheet, and a `@source` glob pointing at the published packages. It is idempotent, so running it
again only adds what is missing. Use `nx add @xui/core` in an Nx workspace, and `--skip-overlay` if
you will not use dialogs, drawers, popovers, tooltips, menus or toasts.

Then add the components you need:

```bash
pnpm add @xui/button @xui/dialog @xui/icon
```

## Theming

To wire the styles by hand, import the token layer once after Tailwind:

```css
@import 'tailwindcss';
@import '@xui/core/styles/theme.css';

/* Only needed for an overlay surface — popover, tooltip, menu, dialog, drawer
   or toast. Without it, overlays render in the document flow. */
@import '@angular/cdk/overlay-prebuilt.css';

/* Tailwind only emits utilities it can see, and it cannot see node_modules by default. */
@source '../node_modules/@xui';
```

Put `.dark` (or `[data-theme='dark']`) on `<html>` to switch themes; with neither present the theme
follows `prefers-color-scheme`. Both selectors work on any element, so a subtree can render in the
opposite theme.

Re-theme by overriding tokens after the import. The `darker` / `lighter` / `subtle` / `muted` /
`emphasis` steps of each intent are derived, so one declaration re-colours the whole ramp:

```css
:root {
  --primary: var(--color-violet-600);
  --surface-inset: var(--color-zinc-50);
}
```

Controls share one density scale — 24 / 30 / 40px for `sm` / default / `lg` — so a button, an input
and a date field on the same row line up. Override `--control-height-md` to re-tune the library.

The full token reference, rendered in both themes, is the **Design tokens** page in Storybook.

## Components

<details>
<summary><strong>All 90 packages</strong>, grouped as they appear in Storybook</summary>

<br />

**Foundations** — [`@xui/icon`](https://www.npmjs.com/package/@xui/icon) · [`@xui/link`](https://www.npmjs.com/package/@xui/link) · [`@xui/text`](https://www.npmjs.com/package/@xui/text)

**Actions** — [`@xui/button`](https://www.npmjs.com/package/@xui/button) · [`@xui/button-group`](https://www.npmjs.com/package/@xui/button-group) · [`@xui/hotkeys`](https://www.npmjs.com/package/@xui/hotkeys)

**Forms** — [`@xui/cascader`](https://www.npmjs.com/package/@xui/cascader) · [`@xui/checkbox`](https://www.npmjs.com/package/@xui/checkbox) · [`@xui/color-picker`](https://www.npmjs.com/package/@xui/color-picker) · [`@xui/control-card`](https://www.npmjs.com/package/@xui/control-card) · [`@xui/control-group`](https://www.npmjs.com/package/@xui/control-group) · [`@xui/editable-text`](https://www.npmjs.com/package/@xui/editable-text) · [`@xui/file-input`](https://www.npmjs.com/package/@xui/file-input) · [`@xui/form-field`](https://www.npmjs.com/package/@xui/form-field) · [`@xui/html-select`](https://www.npmjs.com/package/@xui/html-select) · [`@xui/input`](https://www.npmjs.com/package/@xui/input) · [`@xui/input-otp`](https://www.npmjs.com/package/@xui/input-otp) · [`@xui/label`](https://www.npmjs.com/package/@xui/label) · [`@xui/multi-select`](https://www.npmjs.com/package/@xui/multi-select) · [`@xui/numeric-input`](https://www.npmjs.com/package/@xui/numeric-input) · [`@xui/radio`](https://www.npmjs.com/package/@xui/radio) · [`@xui/rate`](https://www.npmjs.com/package/@xui/rate) · [`@xui/rich-text-editor`](https://www.npmjs.com/package/@xui/rich-text-editor) · [`@xui/segmented-control`](https://www.npmjs.com/package/@xui/segmented-control) · [`@xui/select`](https://www.npmjs.com/package/@xui/select) · [`@xui/slider`](https://www.npmjs.com/package/@xui/slider) · [`@xui/suggest`](https://www.npmjs.com/package/@xui/suggest) · [`@xui/switch`](https://www.npmjs.com/package/@xui/switch) · [`@xui/tag-input`](https://www.npmjs.com/package/@xui/tag-input) · [`@xui/textarea`](https://www.npmjs.com/package/@xui/textarea) · [`@xui/transfer`](https://www.npmjs.com/package/@xui/transfer) · [`@xui/tree-select`](https://www.npmjs.com/package/@xui/tree-select) · [`@xui/upload`](https://www.npmjs.com/package/@xui/upload)

**Date & time** — [`@xui/date-input`](https://www.npmjs.com/package/@xui/date-input) · [`@xui/date-picker`](https://www.npmjs.com/package/@xui/date-picker) · [`@xui/date-range-input`](https://www.npmjs.com/package/@xui/date-range-input) · [`@xui/date-range-picker`](https://www.npmjs.com/package/@xui/date-range-picker) · [`@xui/time-picker`](https://www.npmjs.com/package/@xui/time-picker) · [`@xui/timezone-select`](https://www.npmjs.com/package/@xui/timezone-select)

**Data display** — [`@xui/avatar`](https://www.npmjs.com/package/@xui/avatar) · [`@xui/card`](https://www.npmjs.com/package/@xui/card) · [`@xui/card-list`](https://www.npmjs.com/package/@xui/card-list) · [`@xui/carousel`](https://www.npmjs.com/package/@xui/carousel) · [`@xui/data-table`](https://www.npmjs.com/package/@xui/data-table) · [`@xui/descriptions`](https://www.npmjs.com/package/@xui/descriptions) · [`@xui/entity-title`](https://www.npmjs.com/package/@xui/entity-title) · [`@xui/kbd`](https://www.npmjs.com/package/@xui/kbd) · [`@xui/statistic`](https://www.npmjs.com/package/@xui/statistic) · [`@xui/status`](https://www.npmjs.com/package/@xui/status) · [`@xui/table`](https://www.npmjs.com/package/@xui/table) · [`@xui/tag`](https://www.npmjs.com/package/@xui/tag) · [`@xui/timeline`](https://www.npmjs.com/package/@xui/timeline) · [`@xui/tree`](https://www.npmjs.com/package/@xui/tree)

**Navigation** — [`@xui/breadcrumb`](https://www.npmjs.com/package/@xui/breadcrumb) · [`@xui/menubar`](https://www.npmjs.com/package/@xui/menubar) · [`@xui/navbar`](https://www.npmjs.com/package/@xui/navbar) · [`@xui/navigation-menu`](https://www.npmjs.com/package/@xui/navigation-menu) · [`@xui/pagination`](https://www.npmjs.com/package/@xui/pagination) · [`@xui/panel-stack`](https://www.npmjs.com/package/@xui/panel-stack) · [`@xui/steps`](https://www.npmjs.com/package/@xui/steps) · [`@xui/tabs`](https://www.npmjs.com/package/@xui/tabs)

**Overlays** — [`@xui/alert`](https://www.npmjs.com/package/@xui/alert) · [`@xui/alert-dialog`](https://www.npmjs.com/package/@xui/alert-dialog) · [`@xui/context-menu`](https://www.npmjs.com/package/@xui/context-menu) · [`@xui/dialog`](https://www.npmjs.com/package/@xui/dialog) · [`@xui/drawer`](https://www.npmjs.com/package/@xui/drawer) · [`@xui/menu`](https://www.npmjs.com/package/@xui/menu) · [`@xui/omnibar`](https://www.npmjs.com/package/@xui/omnibar) · [`@xui/popover`](https://www.npmjs.com/package/@xui/popover) · [`@xui/toast`](https://www.npmjs.com/package/@xui/toast) · [`@xui/tooltip`](https://www.npmjs.com/package/@xui/tooltip)

**Feedback** — [`@xui/callout`](https://www.npmjs.com/package/@xui/callout) · [`@xui/non-ideal-state`](https://www.npmjs.com/package/@xui/non-ideal-state) · [`@xui/progress-bar`](https://www.npmjs.com/package/@xui/progress-bar) · [`@xui/result`](https://www.npmjs.com/package/@xui/result) · [`@xui/skeleton`](https://www.npmjs.com/package/@xui/skeleton) · [`@xui/spinner`](https://www.npmjs.com/package/@xui/spinner)

**Layout** — [`@xui/accordion`](https://www.npmjs.com/package/@xui/accordion) · [`@xui/aspect-ratio`](https://www.npmjs.com/package/@xui/aspect-ratio) · [`@xui/collapse`](https://www.npmjs.com/package/@xui/collapse) · [`@xui/divider`](https://www.npmjs.com/package/@xui/divider) · [`@xui/dock-manager`](https://www.npmjs.com/package/@xui/dock-manager) · [`@xui/overflow-list`](https://www.npmjs.com/package/@xui/overflow-list) · [`@xui/scroll-area`](https://www.npmjs.com/package/@xui/scroll-area) · [`@xui/section`](https://www.npmjs.com/package/@xui/section) · [`@xui/splitter`](https://www.npmjs.com/package/@xui/splitter)

**Visualisation** — [`@xui/echarts`](https://www.npmjs.com/package/@xui/echarts) · [`@xui/konva`](https://www.npmjs.com/package/@xui/konva) · [`@xui/node-graph`](https://www.npmjs.com/package/@xui/node-graph)

</details>

## AI coding agents

Two pieces of tooling teach coding agents how to build with xUI.

**MCP server** — [`@xui/mcp`](libs/mcp/README.md) exposes every package's real API (selectors, signal
inputs, variant axes, outputs), the design tokens, the docs and the Storybook examples as MCP tools.
It extracts them from the library sources, so every package is covered and the answers match the
installed version.

```json
{
  "mcpServers": {
    "xui": { "command": "npx", "args": ["-y", "@xui/mcp"] }
  }
}
```

In this repository `.mcp.json` already points at `dist/libs/mcp/src/server.js` — run
`pnpm nx build mcp` once so it exists.

**Skill** — [`skills/xui`](skills/xui/SKILL.md) is the procedural knowledge: the three-layer
architecture, discovery through the MCP server, composition and styling rules, theming, the
generators, and the conventions for authoring a package inside the monorepo. `.claude/skills/xui`
links to it for agents working in this repository.

## Browser support

The browsers Angular itself supports — see the
[Angular browser support policy](https://angular.dev/reference/versions#browser-support).

## Development

The workspace is [Nx](https://nx.dev) + pnpm.

```bash
pnpm install
pnpm start                     # documentation site on :4200
pnpm storybook                 # component gallery on :4400
pnpm nx serve admin            # the example admin application
pnpm test                      # unit tests
pnpm nx test-storybook ui-storybook   # render every story in headless Chromium
pnpm build                     # build every package
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org) and are linted — the
release is cut from them. See [docs/releasing.md](docs/releasing.md) for how a version is published,
[apps/ui-storybook/README.md](apps/ui-storybook/README.md) before writing stories, and
[apps/app/README.md](apps/app/README.md) for the documentation site, whose component pages are
generated from those same stories, and [apps/admin/README.md](apps/admin/README.md) for the example
admin application — a full app built from these packages, which is the fastest way to see how they
fit together.

## Contributing

Bugs and ideas are welcome in [issues](https://github.com/Rikarin/xui/issues). For a change of any
size, open an issue first so the API can be agreed before the code exists.

## License

See [LICENSE](LICENSE).
