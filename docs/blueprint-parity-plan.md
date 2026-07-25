# xUI ⇄ Blueprint Parity — Implementation Plan

Goal: bring `@xui/*` to feature parity with [Blueprint](https://blueprintjs.com) (`/Users/jiu/Projects/blueprint`),
implemented idiomatically for Angular 22 (signals, zoneless, standalone, OnPush), with a
Storybook story and a small test suite per component.

Out of scope: `apps/app` (docs site) is reworked later — touch only when a build break forces it.

---

## 1. Current state

**Workspace**: Nx 23 monorepo, Angular 22.0.8, Tailwind 4, CVA + `tailwind-merge`, pnpm.

**Layering (already established, keep it):**

| Layer     | Path                        | Package            | Role                                                                          |
| --------- | --------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| Utilities | `libs/core/src`             | `@xui/core`        | `xui()` class merger, injection-token factory                                 |
| Headless  | `libs/core/<name>`          | `@xui/core/<name>` | Unstyled behavior/a11y primitives (`x-checkbox`, table, forms, date adapters) |
| Styled    | `libs/ui/<name>/xui`        | `@xui/<name>`      | CVA-styled directives/components (`xuiButton`, `xui-checkbox`)                |
| Stories   | `apps/ui-storybook/stories` | —                  | Central Storybook 10 (Vite builder)                                           |

**Existing packages (14):** badge, breadcrumb, button, button-group, checkbox, form-field, icon,
input, label, skeleton, sonner, spinner, status, table.

**Blueprint surface to match:** ~62 exported components in `@blueprintjs/core`, 5 in `select`,
7 in `datetime`/`datetime2`, plus the `table` grid and `labs` (box/flex/slot).

**Gaps in the current setup that block scale-up:**

1. **Tests** — 1 spec file in the whole repo (`libs/core/table/.../column-manager.spec.ts`). No
   component test conventions, no shared test harness.
2. **No overlay foundation** — `@angular/cdk` 22.0.6 is a dependency but only `a11y`, `coercion`,
   `table` are used. Popover/tooltip/dialog/menu/toast all need `cdk/overlay` + `cdk/portal`.
3. **Theme is thin** — 6 intents × (base/darker/lighter/foreground) + background/foreground.
   No surface elevation, border, muted-text or state-layer tokens; components hardcode
   `bg-gray-600`, `text-foreground/30` etc.
4. **Generators are incomplete** — `xui-library` still writes an `NgModule`-style index while
   real packages export `const XuiXImports = [...] as const`; no spec-file template.
5. **`tsconfig.base.json` `paths` are hand-maintained** — 30+ new entries incoming.

---

## 2. Target conventions (definition of done per component)

Every component ships as one publishable Nx library `libs/ui/<name>/xui` → `@xui/<name>`:

```
libs/ui/<name>/xui/
├── src/
│   ├── index.ts                 # export * + `export const Xui<Name>Imports = [...] as const`
│   ├── test-setup.ts
│   └── lib/
│       ├── <name>.ts            # component/directive
│       ├── <name>.token.ts      # injectXui<Name>Config() defaults (when it has variants)
│       └── <name>.spec.ts       # co-located tests
├── package.json  ng-package.json  project.json  jest.config.ts  tsconfig*.json
apps/ui-storybook/stories/<name>.stories.ts
```

**Code rules**

- `ChangeDetectionStrategy.OnPush`, standalone, zoneless-safe (no `setTimeout`-driven CD).
- Signal APIs only: `input()`, `input.required()`, `model()`, `output()`, `computed()`,
  `linkedSignal()`, `viewChild()`, `contentChildren()`, `effect()` as last resort.
- Boolean inputs via `input<boolean, BooleanInput>(false, { transform: booleanAttribute })`.
- Styling: `cva()` variant map + `xui(...)` merge, exposed on `host: { '[class]': 'computedClass()' }`;
  always accept a `class = input<ClassValue>('')` escape hatch.
- Defaults come from an injection token (`createInjectionToken` in `@xui/core`) so apps can
  re-theme globally — the `button`/`checkbox`/`icon` `.token.ts` files are the reference.
- Prefer a **directive on a native element** (`<button xuiButton>`, `<table xuiTable>`) over a
  wrapper component whenever the native element is semantically correct; use a component when
  the thing owns structure or state.
- Behavior that is non-trivial and reusable (roving tabindex, overlay lifecycle, query/filter
  logic, date math) goes headless into `@xui/core/<name>`; `@xui/<name>` only styles it.
- Forms: implement `ControlValueAccessor` on anything with a value; reuse
  `@xui/core/forms` (`ChangeFn`, `TouchFn`, `ErrorStateTracker`).
- A11y: correct roles/aria wiring, keyboard interaction per WAI-ARIA APG, `FocusMonitor`/
  `FocusTrap` from `cdk/a11y` where relevant.

**Tests (Jest + `jest-preset-angular`, 4–8 per component)** — a host component in `TestBed`, then:

1. renders + applies base classes;
2. each variant/size/intent input maps to the expected class (spot-check, not snapshot the world);
3. the `class` input merges rather than replaces;
4. outputs/`model()` two-way binding fire correctly;
5. a11y contract (role, `aria-*`, `data-state`, `tabindex`, disabled semantics);
6. keyboard interaction for interactive components;
7. `ControlValueAccessor` round-trip (`writeValue` → DOM, DOM → `onChange`) for form controls.

**Story** — CSF3, `Meta<Xui...>` + `moduleMetadata`, `argTypes` for every variant input, plus
`Default`, one story per variant axis, a `Colors`/`Intents` matrix, and `Disabled`/edge states.
Follow `apps/ui-storybook/stories/button.stories.ts`.

---

## 3. Phase 0 — Foundations (blocking; do first)

### 0.1 Design tokens / theme — ✅ done

Keep the semantic-token approach, but grow it into a GitHub-Primer-shaped scale built from the
Tailwind 4 palette. Single source: was `apps/ui-storybook/.storybook/tailwind.css` (duplicated in
`apps/app/src/styles.css`) → now `libs/core/styles/theme.css`, published as
`@xui/core/styles/theme.css` and imported by Storybook, the docs app and consumers.

Token groups (light + dark):

| Group     | Tokens                                                                                                                               | Tailwind source (light → dark)             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Surfaces  | `--surface`, `--surface-raised`, `--surface-overlay`, `--surface-sunken`, `--surface-inset`                                          | `white`/`zinc-50` → `zinc-900`/`zinc-950`  |
| Text      | `--foreground`, `--foreground-muted`, `--foreground-subtle`, `--foreground-on-emphasis`                                              | `zinc-950/700/500` → `zinc-100/400/500`    |
| Borders   | `--border`, `--border-muted`, `--border-strong`                                                                                      | `zinc-200/100/300` → `zinc-700/800/600`    |
| Intents   | existing `primary/secondary/success/error/warning/info` + `*-subtle`, `*-emphasis`, `*-muted` (tinted backgrounds for callouts/tags) | `blue/indigo/green/red/amber/sky`          |
| State     | `--focus`, `--link`, `--selection`, `--hover-overlay`, `--active-overlay`                                                            | `sky-500`, `zinc-500/8%`                   |
| Elevation | `shadow-elevation-{0..4}`, `shadow-overlay`                                                                                          | Blueprint-like tight shadows, not Material |
| Motion    | `--duration-fast/base/slow`, `--ease-standard/decelerate/accelerate`                                                                 | 100/200/300ms                              |

Rules: no raw Tailwind color in a component (`bg-gray-600` in `status.ts` was a bug);
intent naming stays xUI's (`error`, not Blueprint's `danger`) — document the alias in the README.

Design notes worth keeping in mind for later phases:

- **Derived ramps.** `darker` / `lighter` / `subtle` / `muted` / `emphasis` are computed from the
  intent base and `--background` via `oklch(from …)` and `color-mix()`. Overriding `--primary`
  alone re-colours the whole ramp, which is what makes re-theming a two-line job.
- **Scoped themes.** `.light` / `.dark` / `[data-theme]` match on _any_ element, not just `:root`,
  so a subtree can render in the opposite theme. This is why the derived-ramp rule repeats every
  theme selector: a custom property referencing `var(--background)` is substituted on the element
  where it is declared, so declaring the ramps only on `:root` would freeze them at the document
  theme. Popovers, dialogs and toasts in Phase 3 rely on this.
- **Elevation is a separate namespace** from Tailwind's `shadow-*` scale, so re-tuning elevation
  never changes what `shadow-md` means in application code.
- **`shadow-elevation-*` maps 1:1 to Blueprint's `Card`/`Section` `elevation` prop** (Phase 2).

**Delivered:** `libs/core/styles/theme.css` (+ `assets`/`exports` wiring in `libs/core`), Storybook
and the docs app both importing it instead of duplicating tokens, a `Design Tokens` Storybook page
with an `All` and a `LightAndDark` story, a README _Theming_ section, and every raw-palette and
opacity-approximated colour in the 14 existing packages replaced with tokens (`status`, `input`,
`skeleton`, `checkbox`, `form-field/hint`, `table/{tr,th,table.directive}`) — plus `--muted`,
`--muted-foreground` and `--text-md`, which components already referenced but nothing defined.

**Follow-up:** run `nx g @xui/tools:update-projects` to propagate the README _Theming_ section into
the 15 per-package READMEs (skipped here to keep this diff reviewable).

### 0.2 Core primitives (`@xui/core/*` secondary entrypoints)

Generated with `nx g @xui/tools:core-secondary-entrypoint <name>`.

**✅ `@xui/core/overlay`** — the single seam every Phase 3 surface sits on, so escape handling,
outside clicks, focus trapping and focus restoration behave identically across all of them.

- `injectXOverlay()` returns a factory bound to the calling injection context, capturing its
  `Injector` and `ViewContainerRef` (so template content stamps in the right place) and closing
  anything still open on destroy. Built on CDK 22's functional `createOverlayRef` API rather than
  the `Overlay` service.
- `XOverlayRef` is single-use and signal-based: `isOpen`, `result`, and an awaitable `closed`
  promise for confirm-style flows. `close()` disposes; reopening asks for a fresh ref, which keeps
  reopen paths free of stale positioning state.
- `XOverlayConfig` covers connected vs global positioning, placement/offset/flip,
  `matchOriginWidth`, backdrop, the four scroll strategies, escape/outside-click/backdrop
  dismissal, focus trap/auto-focus/restore, template `context`, and the ARIA attributes.
- `XPlacement` uses the Floating-UI/Popper naming Blueprint uses (`top-start`, `bottom-end`, …);
  `connectedPositions()` translates it to CDK's corner pairs and generates flip/shift fallbacks in
  the same order Floating UI's middleware produces, so ported components land in the same place.

  Two things worth remembering: CDK's _vertical_ positions are `top|center|bottom` but its
  _horizontal_ ones are `start|center|end` — `left`/`right` are not valid there — and an outside
  click on the trigger is deliberately ignored, otherwise a toggle handler reopens what the
  dismissal just closed and the overlay flickers instead of toggling.

**✅ `@xui/core/interactions`** — `injectElementSize()` (signal-based `ResizeObserver`, SSR-safe,
stays 0×0 where unavailable), the `[xResizeSensor] (xResize)` directive that is xUI's
`ResizeSensor`, and `injectOutsideClick()` for the non-overlay dismissal cases (inline editors,
expanding search fields). Also the measurement step for overflow lists, auto-resizing textareas and
the data grid's column sizing.

**✅ `@xui/core/a11y`** — `uniqueId()` / `resolveId()` for the `aria-labelledby`/`describedby`
wiring overlay surfaces need between elements in different parts of the tree. Roving tabindex and
hotkeys land here with their first consumer (Phase 4/5) rather than being built speculatively; CDK
already supplies `ListKeyManager` and `FocusKeyManager` underneath.

Still to build, each with its consumer:

- `@xui/core/query` — Blueprint's `QueryList` logic (predicate filtering, item renderer contract,
  keyboard navigation, create-new-item) reused by Phase 6.
- `@xui/core/forms` — extend the existing entrypoint with a shared `XuiControl` base
  (id, disabled, required, error state, describedby wiring).

**Consumer requirement:** apps using any overlay surface must import
`@angular/cdk/overlay-prebuilt.css` alongside the theme — without it overlays render in the
document flow. Noted in the README's Theming section.

### 0.3 Tooling — ✅ done

`nx g @xui/tools:library <name> --generate=component|directive --story` now produces a package
that passes `test lint build` unedited, matching the conventions in §2:

- **`xui-library`** — writes the `Xui<Name>Imports` const barrel (was an `NgModule`), the
  `@xui/<name>` package.json (`sideEffects`, peer deps, `publishConfig`, version taken from
  `@xui/core`), and repairs two things Nx's Angular library generator gets wrong for this
  workspace: a `tsconfig.spec.json` `include` rooted at the import path rather than the tsconfig's
  own directory (so `src/**/*.spec.ts` matched nothing), and a CommonJS `jest.config.cts` where
  every other library uses an ESM `jest.config.ts`. It also generates the component/directive
  _before_ the story so the story's selector matches what was produced.
- **`xui-component` / `xui-directive`** — emit `Xui<Name>` in `<name>.ts` (was
  `Xui<Name>Component` in `<name>.component.ts`, which no published package uses), plus a
  `<name>.token.ts` config token and a `<name>.spec.ts` with four working tests and three
  `it.todo` markers for the variant/a11y assertions that only make sense once the CVA has real
  classes. The directive template also referenced variant names its generator never passed —
  it could not produce compiling output.
- **`xui-story`** — CSF3 against `@storybook/angular-vite` with `argTypes` for every variant axis
  and `Default`/`Sizes`/`Colors` stories, written into `apps/ui-storybook/stories/` (it used to
  land next to the library, where Storybook does not look).
- **`libs/testing`** (`@xui/testing`, not published) — `render()` mounts a template against a
  throwaway host with a `props` signal for re-bindable inputs, and returns `query`/`queryAll`/
  `setProps` plus `click`/`press`/`type` helpers that dispatch a real DOM event _and_ run change
  detection. That pairing matters: the suite is zoneless, so a bare `element.click()` updates
  component state while leaving the DOM stale. Also `expectClasses`/`expectNoClasses`/
  `expectAttributes` (order-independent, and distinguishing an absent attribute from an empty one)
  and free-function event helpers for tests that need to assert between event and re-render.
- **Test environment** — every `test-setup.ts` moved from `setupZoneTestEnv` to
  `setupZonelessTestEnv`, so the tests actually exercise the zoneless support the library claims.
- **`.github/workflows/ci.yml`** — `nx affected -t lint test build` plus `format:check` and a
  Storybook build, on PRs and pushes to master/develop. `nx.json` already listed this file under
  `sharedGlobals`; it had never existed.
- **eslint** — spec files may depend on the non-buildable `@xui/testing` (they are excluded from
  `tsconfig.lib.json` and never reach a published bundle); the boundary rule stays strict
  everywhere else.

### 0.4 Spec backfill for the existing packages — ✅ done

118 passing tests across all 14 published packages plus the harness, covering base classes, each
variant axis, `class`-input merging, config-token defaults and override precedence, the
accessibility contract (roles, `aria-*`, `data-state`, tab order), and `ControlValueAccessor`
round-trips. Notable per-package points:

- `form-field` tests against a local fake `XFormFieldControl` rather than importing `@xui/input`,
  so the packages stay decoupled.
- `sonner` asserts on the `class` input ngx-sonner receives, because ngx-sonner takes `class` as
  an input and applies it to a toast list it renders lazily — the classes never reach the host.
  Its `test-setup.ts` stubs `matchMedia`, which jsdom does not implement.
- CI: add `nx affected -t test lint build` gate; flip Storybook a11y `test: 'todo'` → `'error'`
  once Phase 1 lands.

---

## 4. Component inventory & phasing

Legend: **NEW** = new package · **UP** = upgrade existing package to Blueprint parity.

### Phase 1 — Primitives & typography (7 packages) — ✅ done

Four new packages (`text`, `divider`, `link`, `progress-bar`) all scaffolded through the fixed
generator, plus three upgrades. Notes worth carrying forward:

- **`@xui/text`** is five directives on native elements — `xuiText`, `xuiHeading`, `xuiBlockquote`,
  `xuiCode`, `xuiCodeBlock`, `xuiList` — so semantics stay in the markup. `xuiHeading` derives its
  size from the host's own tag; `level` only overrides the _appearance_, because the heading level
  is what assistive technology navigates by and must not follow a styling choice. `xuiList` picks
  its marker from the host tag via `[&:is(ol)]:list-decimal`, so one directive covers both.
- **`ellipsize` only sets `title` while the text actually overflows** — a tooltip repeating visible
  text is noise, and a screen reader announces it on top of the content. Measurement is driven by
  `injectElementSize`, plus a public `remeasure()` for content that changes without a resize;
  measuring on every render would mean a `scrollWidth` reflow per instance per CD cycle, which is
  the cost Blueprint explicitly warns about.
- **`@xui/spinner` was rebuilt** around a two-circle SVG with `stroke-dasharray`, so it supports a
  determinate `value` (Blueprint's 0–1 fraction) alongside the indeterminate spin, and drops
  `aria-valuenow` entirely while indeterminate.
- **`@xui/skeleton` gained a `xuiSkeleton` directive** that masks an element in place rather than
  replacing it, so the layout does not shift when content arrives — xUI's `Classes.SKELETON`.
  Masked content is `inert` + `aria-hidden` + `tabindex="-1"`: placeholder text must not be
  focusable or announced. Every mask class carries `!` because the host's own directive writes to
  the same `class` attribute — without it, `bg-primary` vs `bg-muted` is decided by Tailwind's
  stylesheet order and a masked button stays blue (caught in the browser, not by the specs).
- **`@xui/icon`** now takes an intent `color` and a `title`. Without a title the icon is decoration
  and gets `aria-hidden`; with one it becomes `role="img"` with that accessible name. Its default
  size was also `'base'`, which is not in the size map — every unsized icon was emitting
  `--ng-icon__size: base`.
- **`@nx/dependency-checks` caught the new packages' undeclared `@angular/cdk` peer dep** — the
  library generator now seeds it, closing risk #8 for future packages.

| Blueprint                                                         | xUI                                         | Notes                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Text`, `Blockquote`, `Code`, `Pre`, `H1–H6`, `OL`, `UL`, `Label` | **NEW** `@xui/text` (+ **UP** `@xui/label`) | Directives on native elements: `<h1 xuiHeading>`, `<code xuiCode>`, `<p xuiText ellipsize>`. `ellipsize` needs `@xui/core/interactions`. |
| `Icon`                                                            | **UP** `@xui/icon`                          | Add `intent` input, standard `IconSize` enum (12/16/20/24), `title`/`aria-hidden` handling.                                              |
| `Divider`                                                         | **NEW** `@xui/divider`                      | Horizontal/vertical, `<div xuiDivider>` + inside menus/navbars.                                                                          |
| `Spinner`                                                         | **UP** `@xui/spinner`                       | Add `value` (determinate), `size`, `intent`; SVG track/head like Blueprint.                                                              |
| `ProgressBar`                                                     | **NEW** `@xui/progress-bar`                 | `value`, `intent`, `stripes`, `animate`, indeterminate.                                                                                  |
| `Skeleton`                                                        | **UP** `@xui/skeleton`                      | Blueprint's skeleton is a class modifier — add `xuiSkeleton` directive that suppresses focus/interaction on children.                    |
| `Link`, `AnchorButton`                                            | **NEW** `@xui/link`                         | `<a xuiLink>` + anchor variant of `xuiButton`.                                                                                           |

### Phase 2 — Layout & content (10 packages) — ✅ done

Nine new packages: `card`, `card-list`, `callout`, `collapse`, `entity-title`, `non-ideal-state`,
`navbar`, `overflow-list`, `section`. Notes worth carrying forward:

- **`overflow-list` measures through an off-screen ruler.** Every item is rendered once, hidden and
  `aria-hidden`, purely to learn its width; the visible count is then derived in one pass. The
  naive alternative — render, measure, re-render — oscillates between two states at the boundary.
  Its "nothing measurable yet" branch shows _everything_ rather than clamping to the measured
  count: the first pass runs before the ruler has laid out, and clamping there collapsed the whole
  list permanently, since nothing else would change to trigger a re-measure. That would also have
  hit any container starting at zero width (inside a hidden parent).
- **`collapse` animates with the Web Animations API**, not `@angular/animations` — keeping the
  dependency out and staying zoneless-clean. It pins the start height before animating, because a
  transition _from_ `auto` does not run at all, and releases the fixed height once open so later
  content growth is not clipped. Content is unmounted while closed; `keepChildrenMounted` trades
  that for avoiding a rebuild, and then relies on `inert` + `aria-hidden`.
- **`card` is a directive, not a component**, so an interactive card can be a real `<button>` or
  `<a>` and gets keyboard activation and focus for free. `aria-selected` is only emitted when the
  card is actually interactive — a static card cannot be selected, so claiming a selection state
  would be a lie.
- **`section` renders its projected body through a single `ng-template`.** An `ng-content` in each
  branch of the collapsible/non-collapsible `@if` does not work: projection slots are static, so
  only the first would ever receive content.
- **`callout` derives its icon from its colour**, and announces error/warning callouts as `alert`
  while leaving informational ones as ordinary content.

- **`XuiBreadcrumbLink` no longer composes `RouterLink`.** Host directives are instantiated
  unconditionally, so composing it made _every_ breadcrumb — routed or not — fail with `NG0201`
  without a `Router` in the injector. Routing is now applied by the consumer (`[routerLink]`
  alongside `xuiBreadcrumbLink`), and the data-driven wrapper only instantiates `RouterLink` inside
  the `@if` branch for items that carry a `link`. A spec renders a trail with no router at all as
  the guard.
- **`<xui-breadcrumbs [items]>`** is the assembled form, wired to `overflow-list`. Three content
  templates mirror Blueprint's renderer props: `xuiBreadcrumbsItem`, `xuiBreadcrumbsCurrent`,
  `xuiBreadcrumbsOverflow`. The collapsed crumbs reach the overflow template and `(overflow)`, so a
  menu can be hung off the ellipsis once Phase 3 lands — Blueprint's version opens a `Popover`
  there, which does not exist yet.
- **`overflow-list` gained `itemRole`.** Its per-item layout wrappers sat between the breadcrumb's
  `role="list"` and its items and broke the chain; the wrappers now carry `role="listitem"` on
  request, which keeps the list semantics without giving up the `<div>` layout.

Worth remembering for browser verification: **a `ResizeObserver` only delivers on a painted frame.**
Reading `hostSize()` from a tab that is not rendering shows `0×0` and nothing ever collapses, which
looks exactly like a broken measurement. Force a paint (a screenshot will do) before reading.

| Blueprint                                                 | xUI                            | Notes                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`                                                    | **NEW** `@xui/card`            | `elevation` 0–4, `interactive`, `compact`, `selected`.                                                                                             |
| `CardList`                                                | **NEW** `@xui/card-list`       | `bordered`, `compact`; composes `@xui/card`.                                                                                                       |
| `Section`, `SectionCard`                                  | **NEW** `@xui/section`         | `title`, `subtitle`, `rightElement`, `collapsible` (needs `@xui/collapse`), `elevation`.                                                           |
| `Callout`                                                 | **NEW** `@xui/callout`         | `intent`, `icon`, `title`, `compact`; uses `*-subtle` tokens.                                                                                      |
| `Collapse`                                                | **NEW** `@xui/collapse`        | Height animation via Web Animations API, not `@angular/animations`; `isOpen` model, `keepChildrenMounted`.                                         |
| `EntityTitle`                                             | **NEW** `@xui/entity-title`    | `title`, `subtitle`, `icon`, `tags`, `heading` size, `loading`.                                                                                    |
| `NonIdealState`                                           | **NEW** `@xui/non-ideal-state` | `icon`, `title`, `description`, `action`, `layout` vertical/horizontal.                                                                            |
| `Navbar`, `NavbarGroup`, `NavbarHeading`, `NavbarDivider` | **NEW** `@xui/navbar`          | Directives + `fixedToTop`.                                                                                                                         |
| `Breadcrumbs`, `Breadcrumb`                               | **UP** `@xui/breadcrumb`       | `<xui-breadcrumbs [items]>` collapses via `@xui/overflow-list`; `current`, icons, `disabled`, three renderer templates; `RouterLink` now optional. |
| `OverflowList`                                            | **NEW** `@xui/overflow-list`   | Headless measure/collapse in `@xui/core/interactions`; `collapseFrom`, `minVisibleItems`, `overflowRenderer`.                                      |

### Phase 3 — Overlays (10 packages, depends on 0.2) — ✅ done

`popover` is the first and the base the rest compose. Notes worth carrying forward:

- **The trigger is a directive on any element** (`[xuiPopover]="tpl"`), not a wrapper component —
  the trigger stays a real `<button>`/`<a>` and the content is a `TemplateRef`, so it renders lazily
  (nothing until open) and unmounts on close. Blueprint wraps the target in a `<Popover>`; the
  directive form is the idiomatic Angular equivalent and avoids an extra element in the layout.
- **`isOpen` is the single source of truth.** An `effect` reconciles the model against the overlay:
  interaction handlers and controlled `[isOpen]` bindings both just move the signal, and the overlay
  closing itself (Escape, outside click) folds back into it via `ref.closed`, so `isOpen` never lies
  about what is on screen. Guard the fold-back write with `untracked` or the effect re-enters.
- **The panel is opened as a component, not the user's template**, because a `ComponentPortal` can't
  bind `@Input`s. `XuiPopoverPanel` reads its config (content template, `minimal`, width) from an
  injected token (`XUI_POPOVER_CONTENT`) instead. Passing the content as a `TemplateRef` keeps the
  trigger's view as its declaration context, so `let-` variables and the trigger's injector still
  resolve. This panel is the shared surface every later preset (tooltip, menu, select) reuses.
- **`interactionKind` covers all four Blueprint modes.** `hover` tracks pointer enter/leave on both
  the trigger _and_ the pane (so the pointer can cross the gap into the content); `hover-target`
  ignores pane hover; `click` toggles; `click-target` opens without toggling shut. Hover uses
  `setTimeout` for the open/close delays — the timer's signal write drives zoneless CD correctly,
  which is a legitimate use of `setTimeout`, distinct from using it to _force_ CD.
- **A hover popover never traps or steals focus**, only click popovers with a role do; a hover card
  that grabbed focus would yank the caret out of whatever the user was doing. Verified in-browser:
  the card opens with `document.activeElement` still on `<body>`, and the trigger carries no
  `aria-haspopup`/`aria-expanded` (a hover card is not a keyboard-operable popup).
- **Deferred: the arrow.** Blueprint's popover arrow uses Popper's arrow middleware; CDK's connected
  strategy does not expose the resolved connection point cleanly, so the arrow needs a
  `positionChanges` subscription to place a caret element. Left out of the first cut to keep it solid
  and tested; the panel surface has a slot for it when it lands.

A **browser-verification gotcha** to remember: opening is driven by an `effect`, which in a zoneless
app flushes on the scheduler _after_ the interaction returns. Reading the DOM synchronously in the
same `javascript_tool` call as the `.click()` shows nothing — split the click and the assertion into
separate evaluations, or the popover looks broken when it is not.

`tooltip` is the second, and the first proof the popover foundation carries a preset. Notes:

- **It is not literally `XuiPopover`.** A tooltip is non-interactive, opens on focus, and _describes_
  rather than labels — different enough that composing the popover directive would fight it. Instead
  it sits on the same `@xui/core/overlay` seam directly, which is the part that actually matters for
  consistency (Escape, positioning, restore-focus). The shared surface idea repeats though: a
  `XuiTooltipPanel` opened as a component, configured through an injected token.
- **`pointer-events-none` on the chip is load-bearing.** Without it the tooltip becomes its own hover
  target — move the pointer onto it and it would never close, and it can cover the very thing it
  describes. This is also why the tooltip needs no pane-hover tracking the way the popover does.
- **It ties itself to the trigger with `aria-describedby`.** The panel carries a stable id (from
  `uniqueId`) and `role="tooltip"`; while open, the trigger points `aria-describedby` at it, so the
  hint is announced with the control rather than floating unattached.
- **Opens on focus, and Escape dismisses it** — the WAI-ARIA tooltip contract. Escape is handled on
  the _trigger_, not the pane, because a focus-opened tooltip leaves focus on the trigger and the
  overlay's own keydown listener never sees it.
- **Empty content never opens.** A tooltip bound to a maybe-empty expression stays quiet instead of
  flashing an empty chip; an `effect` also hides it the moment it is disabled or its content empties.
- The neutral (`none`) chip **inverts against the page** — `bg-foreground text-background`, a dark
  chip on light and a light chip on dark — matching Blueprint's default tooltip. Verified in-browser
  once a dev-server Tailwind rescan picked up the new file (see the gotcha below).

Another **verification gotcha**, this one about the dev server, not the code: a brand-new file's
Tailwind classes may not be in the running dev server's content scan, so a class like `bg-foreground`
(used nowhere else) shows as applied-but-unstyled — transparent — while the production
`build-storybook` generates it correctly. Restarting the preview forces a rescan. Check the built CSS
before suspecting the component.

`menu` is the third, and the first to lean on a _different_ CDK primitive. Notes:

- **It is built on `@angular/cdk/menu`, not `@xui/core/overlay`.** cdk/menu couples trigger, panel,
  roving focus, typeahead, submenu pointer-aim, Escape and close-on-select into one system; splitting
  that to route through our overlay would mean reimplementing the keyboard model, the hardest part.
  So the menu takes cdk/menu whole and only dresses the panel and items — the plan always earmarked
  cdk/menu here. Everything visual is xUI; everything behavioural is cdk. `context-menu` will reuse
  the same panel through `CdkContextMenuTrigger`, which is exactly why this was worth doing properly.
- **Every part composes a cdk directive via `hostDirectives`** and re-aliases its inputs into xUI
  vocabulary, so the markup stays `xui*` with no `cdk*` attributes leaking in: `XuiMenu`←`CdkMenu`,
  `XuiMenuItem`←`CdkMenuItem` (`cdkMenuItemDisabled`→`disabled`, `cdkMenuItemTriggered`→`triggered`),
  `XuiMenuTrigger`←`CdkMenuTrigger` (`cdkMenuTriggerFor`→`xuiMenuTriggerFor`). Watch the alias source
  names — a `hostDirectives` output list uses the directive's _public_ output name, so it is
  `cdkMenuOpened`/`cdkMenuClosed`, not the property names `opened`/`closed`.
- **A menu item is a real `<button>`/`<a>`**, so activation and disabled semantics are the element's.
  Disabled styling keys off the `aria-disabled` cdk already reflects (`aria-disabled:opacity-50
aria-disabled:pointer-events-none`) — no need to read the value into a signal.
- **Submenus fall out for free.** An item that also carries `xuiMenuTriggerFor` becomes a submenu
  parent; the item detects the trigger with `inject(CdkMenuTrigger, { optional: true, self: true })`
  to show its chevron. Verified in-browser: ArrowRight opens the nested menu and moves focus into it,
  cascading to a third level.
- **A left cell is always reserved** (icon, or checkmark when `selected`) so labels line up across
  rows; the divider is a `role="separator"` rule, or a labelled group header when given a `title`.
- Browser-verified the parts jsdom can't: arrow-key roving focus, typeahead, the submenu cascade, and
  cdk auto-focusing the first item on open. Escape needs `keyCode: 27` in tests — cdk reads
  `keyCode`, not `key` (the same quirk the overlay Escape tests already work around).

The **modal family — `context-menu`, `dialog`, `alert`, `drawer` — landed together.** Notes:

- **`context-menu` is `menu` with a different opener.** `[xuiContextMenuTriggerFor]` aliases
  `CdkContextMenuTrigger` and opens the very same `@xui/menu` panel at the pointer on right-click —
  submenus, keyboard and dismissal all inherited. The package has no styling of its own; that reuse is
  the whole point, and it is why `menu` was built on cdk/menu rather than our overlay.
- **A shared reopen-race fix, applied to every overlay-backed surface** (dialog, drawer, and
  retro-fitted into popover and tooltip). The overlay's `closed` promise resolves on a _microtask_,
  so the pattern `ref.closed.then(() => this.ref = null)` leaves `this.ref` stale for one tick. A
  synchronous close-then-reopen (which tests do, and rapid users can) then either no-ops the reopen or
  lets the old ref's late `closed` clobber the new one. The fix everywhere: **null `this.ref`
  synchronously in `detach`, and guard the `closed` handler with `if (this.ref !== ref) return`** so a
  superseded ref's resolution is inert. This is the single most important correctness lesson of the
  batch — any future overlay surface must follow it.
- **`dialog` is declarative and controlled**: `[(isOpen)]`, its content attached to a modal overlay
  (backdrop, focus trap, scroll lock, focus restore) only while open. `XuiDialogService.open(cmp)`
  is the imperative twin — it mounts the component on the same modal overlay and provides a
  `XuiDialogRef` the component injects to close itself with a typed result, so `await ref.closed` is a
  confirm flow. The surface classes live in one place (`dialog.token.ts`) shared by both paths.
- **`alert` composes `dialog`** — no title bar, no close button, a fixed confirm/cancel pair — and
  treats _any_ dismissal (Escape, backdrop) as a cancel via an `isOpen` effect that reports a close it
  did not itself initiate. `XuiAlertService.confirm()` returns `Promise<boolean>`; browser-verified it
  resolves `true`/`false`. The service reuses `XuiDialogService` + `XuiDialogRef<boolean>`.
- **`drawer` needed a core-overlay extension.** The overlay only centred `global` overlays; a drawer
  pins to an edge, so `XOverlayConfig` gained `globalPosition` (edge offsets + optional axis
  centring), driving `GlobalPositionStrategy` — `toast` will reuse it for corner placement. The
  drawer slides in with the Web Animations API (no `@angular/animations`), respects
  `prefers-reduced-motion`, and pins full-cross-axis to its edge. Browser-verified the pin (via the
  cdk wrapper's `justify/align`) and resting position.

A **browser gotcha for both drawer animation and any WAAPI**: like `ResizeObserver`, a Web Animation
only advances while the page paints. A headless read caught the drawer frozen at its _start_ keyframe
(`translateX(100%)`, fully off-screen) — a screenshot forced a paint and it settled to the pinned
resting position. Don't diagnose a stuck transform from a non-painting tab.

The last two — **`toast` and `panel-stack`** — closed the phase. Notes:

- **`toast` is a service, not a component you place.** `XuiToastService.show({...})` keeps the live
  notices in a signal and lazily mounts _one_ corner-pinned overlay (reusing the new `globalPosition`)
  the first time it is called — no backdrop, `scrollStrategy: 'noop'`, and `pointer-events-none` on the
  stack so the page stays fully usable, with each toast re-enabling pointer events for its own buttons.
  Past `maxToasts` the oldest is dropped. Bottom positions use `flex-col-reverse` so a new toast
  appears nearest its edge. Browser-verified the corner pin and pointer pass-through; 9 unit tests
  (driven by `ApplicationRef.tick()`, since the container mounts on the app ref, not a fixture view)
  cover stacking, timeout, sticky, action, dismiss and the cap.
- **`panel-stack` is a signal-driven stack**, not an overlay — a drill-down in a fixed box. Only the
  top panel renders; a panel's content navigates through a `stack` controller handed to a template
  (`let-stack`) or injected by a component panel (`XUI_PANEL_STACK` + `XUI_PANEL_DATA`). The header
  shows a back button labelled with the panel beneath and a centred title; push/pop slides via WAAPI
  (reduced-motion aware). The `content` union (`TemplateRef | Type`) can't narrow through a method
  call in a template, so it is split into two pre-narrowed computeds
  (`templateContent`/`componentContent`) for the `ngTemplateOutlet` vs `ngComponentOutlet` branches.
  Browser-verified the Settings → Account drill (with injected `data`) and back navigation.
- Both stub `Element.prototype.animate` in their specs — jsdom has no Web Animations API, and the
  slide is decorative. Same pattern the drawer established.

| Blueprint                                                               | xUI                            | Notes                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Portal`                                                                | (core) `@xui/core/portal`      | No published UI package.                                                                                                                                                                                                                                                                             |
| `Overlay2`                                                              | **NEW** `@xui/overlay`         | Public wrapper over `@xui/core/overlay`: `isOpen` model, backdrop, `canEscapeKeyClose`, `canOutsideClickClose`, `enforceFocus`, `usePortal`, transition hooks, stacking.                                                                                                                             |
| `Popover`/`PopoverNext`                                                 | **✅ NEW** `@xui/popover`      | `[xuiPopover]="tpl"` trigger directive; `interactionKind` click/hover/hover-target/click-target, `placement`, `offset`, `hoverOpenDelay`/`hoverCloseDelay`, `minimal`, `matchTargetWidth`, `disabled`, controlled `isOpen`. Arrow deferred. 15 tests, browser-verified.                              |
| `Tooltip`                                                               | **✅ NEW** `@xui/tooltip`      | `[xuiTooltip]="'text'                                                                                                                                                                                                                                                                                | tpl"`on the overlay foundation;`placement`, `intent`(6),`compact`, `openOnTargetFocus`, hover delays, `disabled`; `aria-describedby`+`role=tooltip`, Escape-dismiss, empty-content guard, non-interactive chip. 13 tests, browser-verified. |
| `Menu`, `MenuItem`, `MenuDivider`                                       | **✅ NEW** `@xui/menu`         | On `cdk/menu` (keyboard, typeahead, submenu aim, close-on-select); `xui-menu`, `[xuiMenuItem]` with `icon`/`selected`/`intent`/`disabled`/`triggered`, `xui-menu-divider` (+`title`), `[xuiMenuTriggerFor]`. Submenus via item + trigger. 11 tests, browser-verified. Checkbox/radio items deferred. |
| `ContextMenu`, `ContextMenuPopover`, `showContextMenu`                  | **✅ NEW** `@xui/context-menu` | `[xuiContextMenuTriggerFor]` aliases `CdkContextMenuTrigger`, opening the `@xui/menu` panel at the pointer. 4 tests, browser-verified. Imperative opener deferred.                                                                                                                                   |
| `Dialog`, `DialogBody`, `DialogFooter`, `DialogStep`, `MultistepDialog` | **✅ NEW** `@xui/dialog`       | `<xui-dialog [(isOpen)]>` + `xui-dialog-body`/`-footer`; `title`/`icon`/`size`/`canEscapeKeyClose`/`canOutsideClickClose`/`showCloseButton`. `XuiDialogService.open()` → injectable `XuiDialogRef<R>`. 9 tests, browser-verified. Multistep deferred.                                                |
| `Alert`                                                                 | **✅ NEW** `@xui/alert`        | `<xui-alert [(isOpen)]>` confirm/cancel over dialog; `intent`(5)+icon, `confirmText`/`cancelText`, any dismissal = cancel. `XuiAlertService.confirm()` → `Promise<boolean>`. 8 tests, browser-verified.                                                                                              |
| `Drawer`                                                                | **✅ NEW** `@xui/drawer`       | `<xui-drawer [(isOpen)]>` `position` left/right/top/bottom, `size`, `title`, `showCloseButton`; edge-pinned modal (new core `globalPosition`), WAAPI slide-in, reduced-motion aware. 8 tests, browser-verified.                                                                                      |
| `Toast`, `OverlayToaster`                                               | **✅ NEW** `@xui/toast`        | `XuiToastService.show({message,intent,icon,actionText,onAction,timeout})` → id; `dismiss`/`clear`, `maxToasts`, `position` (6). Corner-pinned overlay, pointer pass-through, auto-dismiss. 9 tests, browser-verified. `@xui/sonner` kept published but frozen.                                       |
| `PanelStack2`                                                           | **✅ NEW** `@xui/panel-stack`  | `<xui-panel-stack [initialPanel]>`; template (`let-stack`) or component (`XUI_PANEL_STACK`/`XUI_PANEL_DATA`) panels, back-navigating header, WAAPI slide, `(opened)`/`(closed)`. 6 tests, browser-verified. Keep-mounted mode deferred.                                                              |

### Phase 4 — Forms — ✅ COMPLETE (17: textarea, switch, radio, numeric-input, file-input, control-group, html-select, segmented-control, checkbox, input/InputGroup, form-field, slider, button-group (up), button (up), editable-text, tag-input, control-card)

First three landed as a batch. Notes worth carrying forward:

- **`switch` and `radio` are custom-element controls, not native inputs**, so two things the browser
  enforces do not apply and must be handled: the `disabled:` Tailwind variant only matches real form
  elements, so use `data-disabled:` with a `[attr.data-disabled]` binding; and a custom element does
  not synthesise a click from Space/Enter, so bind `(keydown.space)`/`(keydown.enter)` and toggle
  explicitly.
- **Disabled has two independent sources** — the `disabled` input and a reactive form's
  `setDisabledState` — so model it as `computed(() => input() || signalFromForm())`, never a single
  `linkedSignal(input)` that one source clobbers. This is the pattern every future control should use.
- **`model()` already provides the `<name>Change` output**, so declaring an explicit `checkedChange`
  /`valueChange` alongside it is a compile error (`NG1054`). Let the model's built-in change output do
  the work; `.set()` emits it.
- **The radio group is the single `ControlValueAccessor`**, holding the value, the shared `name` and
  one tab stop; each `xui-radio` reads its state from the group via a token and holds nothing but its
  `value`. Arrow keys move selection (and focus follows) per the WAI-ARIA radio pattern.
- **A browser-only bug the tests missed:** `contentChildren` defaults to _direct_ children, but radios
  are normally wrapped in a `<label>`, so the group found **zero** buttons and arrow-nav silently did
  nothing. The unit test had un-wrapped radios and passed. Fix: `{ descendants: true }`, plus a
  regression test that wraps radios in labels. Lesson: test form controls in their real
  `<label>`-wrapped markup, not the bare element.
- **`textarea` is a directive on the native element** (like `input`), so `ngModel`/validation/error
  styling come for free; `autoResize` measures `scrollHeight` on input and turns manual resize off (the
  two fight). Collapse height to `auto` before measuring so a shrink is caught, not just growth.
- **`numeric-input` keeps the value a `number | null`** — empty is `null`, not `0`, so "no answer" is
  distinct from zero. Two signals cooperate: `value` (parsed) and `text` (what the field shows), so a
  half-typed entry (`"1."`, `"-"`) survives until blur while the parsed value stays valid. Step math
  rounds to a `1e10` grid so `0.1 + 0.2` is `0.3`, not `0.30000000000000004`. **The `value` input needs
  an explicit numeric transform** — without it `value="5"` arrives as the string `"5"` and `"5" + 1`
  concatenates to `"51"`; a bug the browser would have shown but the number-bound tests nearly hid.
  Shift = `majorStepSize`, Alt = `minorStepSize`, and the stepper disables at the bound.
- **`file-input` wraps a hidden real `<input type="file">`** so the native picker, `accept` and
  `multiple` work; the label shows the filename or an `N files` count. A file input is **write-only for
  security**, so `writeValue` can only _clear_ the selection, never pre-fill it — the CVA honours a
  reset and nothing more. jsdom has no `DataTransfer`, so its tests build a `FileList`-shaped object by
  hand.
- **`html-select` frames a real native `<select>`** — the platform dropdown/keyboard/mobile behaviour
  kept, only a chevron added. Options come as data _or_ projected `<option>`s. The DOM only carries
  strings, so on change it recovers the original typed value (number, object) by matching `String(v)`
  against the data options — otherwise a `[value]="1"` round-trips as `"1"`.
- **`segmented-control` is `@xui/radio` with a different skin** — `role="radiogroup"`, one tab stop,
  arrow-key navigation, but rendered as a pill bar from an `options` array. `select()` guards the
  _option's own_ disabled state, not just the group's: a disabled `<button>` blocks native clicks but
  nothing stops a programmatic one (the same class of gap the segmented-control test caught).
- **`control-group` collapses adjacent controls into one unit** — the radii between neighbours go
  square and the shared 1px border is overlapped with a negative margin (`-ml-px`/`-mt-px`) so it never
  reads as double-width. Extends `@xui/button-group`'s pattern to a vertical axis and adds `fill`.

| Blueprint                                 | xUI                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `InputGroup`                              | **✅ UP** `@xui/input`              | Added `xui-input-group` (+ `[xuiInputLeftElement]`/`[xuiInputRightElement]`) that reserves the input's inline padding for adornments, and a `clearable` clear button that seeds from the mounted value and round-trips a synthetic `input` event; `intent` accent border on `[xuiInput]`. Adornments centre by translate (a sized `ng-icon` over-constrains `inset-y-0`). 17 tests, browser-verified. `round`/`asyncControl` deferred.                                                                                                                                                          |
| `TextArea`                                | **✅ NEW** `@xui/textarea`          | `textarea[xuiTextarea]` directive; `size`, `autoResize` (scrollHeight, resize-off), token-driven error styling, full CVA passthrough. 9 tests, browser-verified.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `NumericInput`                            | **✅ NEW** `@xui/numeric-input`     | `xui-numeric-input`; `number\|null` value, `min`/`max`/`stepSize`/`majorStepSize`(Shift)/`minorStepSize`(Alt), `clampValueOnBlur`, steppers (`buttonPosition`), `role=spinbutton`, exact fractional steps, full CVA. 10 tests, browser-verified. Locale parsing deferred.                                                                                                                                                                                                                                                                                                                       |
| `FileInput`                               | **✅ NEW** `@xui/file-input`        | `xui-file-input` over a hidden real file input; `text`/`buttonText`/`accept`/`multiple`/`size`/`fill`, filename/`N files` label, `FileList` value, reset-only CVA. 8 tests, browser-verified.                                                                                                                                                                                                                                                                                                                                                                                                   |
| `Checkbox`                                | **✅ UP** `@xui/checkbox`           | Added `label` input + content projection, `alignIndicator` (start/end), `inline`, `large`; box stays a custom `role=checkbox` button, so the label text forwards its click to `toggle()` (deliberately not a second tab stop) and the box is auto-named from `label`. Kept the headless `x-checkbox`. 18 tests, browser-verified.                                                                                                                                                                                                                                                               |
| `Radio`, `RadioGroup`                     | **✅ NEW** `@xui/radio`             | `xui-radio-group` (CVA, owns value/name/tab-stop, arrow-key nav, `orientation`, `disabled`) + `xui-radio` (`value`, `size`, `disabled`). `role=radiogroup`/`radio`. 9 tests, browser-verified. Headless `@xui/core/radio` folded inline for now.                                                                                                                                                                                                                                                                                                                                                |
| `Switch`                                  | **✅ NEW** `@xui/switch`            | `xui-switch` `role=switch` button; `checked` model, `size` (default/large), `disabled`, Space/Enter, full CVA. 8 tests, browser-verified. `innerLabel`/`alignIndicator` deferred.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ControlGroup`                            | **✅ NEW** `@xui/control-group`     | `[xuiControlGroup]`; `vertical`, `fill`; collapses radii + overlaps the shared border between neighbours. 4 tests, browser-verified.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `FormGroup`                               | **✅ UP** `@xui/form-field`         | Added `label`/`labelInfo`/`subLabel`/`helperText`/`intent`/`inline` inputs on top of the projection API; `<label for>` auto-associates by assigning the projected control our generated id (or reusing its own), so the association is real, not decorative. helperText hides in the error state; intent tints label + helper. 14 tests, browser-verified.                                                                                                                                                                                                                                      |
| `HTMLSelect`                              | **✅ NEW** `@xui/html-select`       | `xui-html-select` frames a native `<select>` + chevron; `options` data or projected `<option>`, `placeholder`, `size`, `fill`, typed-value recovery, full CVA. 8 tests, browser-verified. Distinct from Phase 6's `@xui/select`.                                                                                                                                                                                                                                                                                                                                                                |
| `Slider`, `RangeSlider`, `MultiSlider`    | **✅ NEW** `@xui/slider`            | `xui-slider` single-handle: `min`/`max`/`stepSize`/`labelStepSize`/`labelRenderer`(fn or `false`), `intent` fill, `vertical`, `showTrackFill`; pointer drag + track-click-to-position (pointer capture), keyboard (arrows/Home/End/PageUp-Down), snapped tick marks + axis labels, exact fractional steps (1e10 grid), `role=slider` + full ARIA value/orientation, `ControlValueAccessor`. Handle centres on the track via 50% cross-axis. 16 tests, browser-verified (h/v, intents, drag, keyboard). `RangeSlider`/`MultiSlider` (multi-handle) and a `@xui/core/slider` extraction deferred. |
| `SegmentedControl`                        | **✅ NEW** `@xui/segmented-control` | `xui-segmented-control`; `options`, `value` model, `size`, `fill`, per-option `disabled`; `role=radiogroup`, roving tabindex, arrow-key nav, full CVA. 8 tests, browser-verified.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `CheckboxCard`, `RadioCard`, `SwitchCard` | **✅ NEW** `@xui/control-card`      | `xui-control-card` with `type` (checkbox/radio/switch) picking the indicator + ARIA role; the card itself is the control (role + `aria-checked` + tabindex + Space/Enter/click), so there is no nested interactive element. `[(checked)]` model + CVA; `showAsSelectedWhenChecked` (accent border while checked); radios only ever select (group via a bound value). 11 tests, browser-verified (checkbox toggle, radio single-select grouping, switch, disabled).                                                                                                                              |
| `EditableText`                            | **✅ NEW** `@xui/editable-text`     | `xui-editable-text`; click/focus+Enter to edit, Enter/blur confirms, Escape reverts; `multiline` (textarea; Enter inserts newline unless `confirmOnEnterKey`), `selectAllOnFocus`, `maxLength`, `placeholder`, `disabled`; `confirmed`/`cancelled`/`edited`/`changed` outputs; `[(value)]` model + `ControlValueAccessor`. 11 tests, browser-verified (edit→confirm round-trips the two-way value).                                                                                                                                                                                             |
| `TagInput`                                | **✅ NEW** `@xui/tag-input`         | `xui-tag-input`; Enter/separator/paste to add, ✕ or Backspace-on-empty to remove; `[(values)]` model + CVA over `string[]`; `separator`, `addOnBlur`, `addOnPaste`, `allowDuplicates`, `fill`, `placeholder`, `disabled`; `added`/`removed` outputs. Commit clears the field imperatively (guards a same-CD draft round-trip). 12 tests, browser-verified (add clears field, remove round-trips the two-way value). `leftIcon`/`rightElement` deferred.                                                                                                                                         |
| `ButtonGroup`                             | **✅ UP** `@xui/button-group`       | Added `vertical` (radii/border collapse on the vertical axis), `fill` (children share width/height equally), `alignText`. 7 tests, browser-verified. `minimal` deferred (needs a DI token the child buttons read).                                                                                                                                                                                                                                                                                                                                                                              |
| `Button`                                  | **✅ UP** `@xui/button`             | Added `fill`, `alignText` (left/center/right), `active` (pressed look + `aria-pressed`), `loading` (a `::before` ring spinner over a `text-transparent` label so the width holds, + `aria-busy`, blocks pointer events). `AnchorButton` is the same directive on `<a>` (verified). 15 tests, browser-verified. `icon`/`endIcon` via content projection (existing `[&_svg]` sizing); `ellipsizeText` deferred.                                                                                                                                                                                   |

### Phase 5 — Data display & navigation (6 packages) — ✅ COMPLETE (tabs, table (up), resize-sensor (core, pre-existing), tag, tree, hotkeys)

| Blueprint                                     | xUI                                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tabs`, `Tab`, `TabPanel`, `TabsExpander`     | **✅ NEW** `@xui/tabs`                 | `xui-tabs`/`xui-tab`/`[xuiTabTitle]`; `[(selectedTabId)]` model, `animate` (indicator measured from the active button via `viewChildren`, orientation-aware), `vertical`, `fill`, `large`, `renderActiveTabPanelOnly` (lazy panels via `TemplateRef`); `role=tablist/tab/tabpanel` with `aria-controls`/`aria-labelledby`, roving tabindex, Arrow/Home/End keyboard nav skipping disabled, focus follows selection. 11 tests, browser-verified (h/v, animated slide, keyboard). Headless `@xui/core/tabs` extraction deferred.                                                                                       |
| `Tag`, `CompoundTag`                          | **✅ NEW** `@xui/tag`                  | `xui-tag`; `intent` (solid) × `minimal` (subtle bordered) fills, `large`, `round`, `fill`, `interactive` (cursor+hover), optional leading `icon`, and `removable` with a ✕ that emits `removed` (stops propagation so it doesn't fire an interactive tag's own click). 8 tests, browser-verified (removal filters the list). `@xui/badge` stays the small static pill.                                                                                                                                                                                                                                               |
| `Tree`, `TreeNode`                            | **✅ NEW** `@xui/tree`                 | `xui-tree` data-driven from `XuiTreeNode[]` (recursive `ng-template`); `label`/`secondaryLabel`/`icon`/`childNodes`/`isExpanded`/`hasCaret`/`disabled`; caret expand/collapse, `[(selectedId)]` model, `nodeClick`/`nodeExpanded`/`nodeCollapsed` outputs; `role=tree/treeitem/group` with `aria-expanded`/`aria-selected`, roving tabindex over a flattened visible list, full keyboard (Up/Down move, Right/Left expand-or-step-in / collapse-or-step-out, Home/End, Enter/Space select). 9 tests, browser-verified (keyboard expand + focus-into-child + select). Built self-contained rather than on `cdk/tree`. |
| `HTMLTable`                                   | **✅ UP** `@xui/table`                 | Added `striped`, `bordered`, `interactive`, `compact` modifier inputs on `xui-table`, reaching rows/cells via descendant selectors so the flex layout of `xui-tr`/`xui-td`/`xui-th` is untouched; the CDK-based `@xui/core/table` data-table path is unchanged. 17 tests, browser-verified.                                                                                                                                                                                                                                                                                                                          |
| `Hotkeys`, `HotkeysProvider`, `HotkeysDialog` | **✅ NEW** `@xui/hotkeys`              | `injectHotkeys([...])` registers global shortcuts scoped to a component's lifetime (auto-removed on destroy); `XuiHotkeysService` owns the registry + a single document keydown dispatcher with `mod`→⌘/Ctrl resolution, punctuation-key shift handling, and a text-field guard (`allowInInput`). `?` opens a grouped, platform-formatted help dialog (`XuiHotkeysDialog` via `@xui/dialog`). Combo parse/match/format are pure + unit-tested. 9 tests, browser-verified (⌘S fires, `?` opens grouped help).                                                                                                         |
| `ResizeSensor`                                | **✅ (core)** `@xui/core/interactions` | Already shipped with the Phase 0.2 foundation: `[xResizeSensor] (xResize)` directive backed by `injectElementSize` (ResizeObserver), holding back the pre-measurement 0×0. Covered by the interactions spec (part of core's 53 tests).                                                                                                                                                                                                                                                                                                                                                                               |

### Phase 6 — Select family (5 packages, depends on Phases 3+4) — ✅ COMPLETE (core/query, select, multi-select, suggest, omnibar)

`@blueprintjs/select` → `@xui/select` package family, all driven by `@xui/core/query`:

| Blueprint     | xUI                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `QueryList`   | **✅** `@xui/core/query`       | `createQueryList<T>({ items, query, itemText?, itemPredicate?, itemListPredicate?, itemDisabled? })` → signal-driven `filteredItems` + an `activeItem` with `moveActiveItem`(wrapping, skips disabled)/`setActiveItem`/`activateFirst`; `linkedSignal` re-seeds the active item when results change but keeps it if it survives. Pure/headless. 9 tests.                                                                                                                                   |
| `Select`      | **✅ NEW** `@xui/select`       | `xui-select` composes the Phase 3 popover + query list; `[(selectedItem)]`, `filterable`, `resetOnClose`, `matchTargetWidth`, custom `[xuiSelectOption]` template (typed `$implicit`/`active`/`selected` context). Search auto-focuses across the overlay boundary (focus-by-id), Arrow/Enter/Escape keyboard, `role=combobox`+`listbox`/`option`. 8 tests, browser-verified (filter→Enter selects, two-way binds, closes). Arbitrary-target projection deferred (default button trigger). |
| `MultiSelect` | **✅ NEW** `@xui/multi-select` | `xui-multi-select` composes popover + query list + inline removable `@xui/tag` chips; `[(selectedItems)]`, click toggles an option (popover stays open, query clears, check shown), Backspace-on-empty removes the last chip, `itemAdded`/`itemRemoved`; reuses `[xuiSelectOption]` from `@xui/select` for custom items. 7 tests, browser-verified (add stays open + clears, chip ✕ remove, two-way binds). `openOnKeyDown` is the default (typing opens).                                 |
| `Suggest`     | **✅ NEW** `@xui/suggest`      | `xui-suggest` typeahead — the text input _is_ the target; typing opens/filters, choosing fills the input with the item's text (an `editing` signal shows the live query while typing, the selected text otherwise), close reverts. Composes popover + query list, reuses `[xuiSelectOption]`. 5 tests, browser-verified (type→Enter fills input + two-way binds).                                                                                                                          |
| `Omnibar`     | **✅ NEW** `@xui/omnibar`      | `xui-omnibar` ⌘K palette — a top-centred `[(isOpen)]` overlay (inline `fixed` + backdrop; `role=dialog`/`combobox`+`aria-controls`) with a search field + keyboard-navigable list; Arrow/Enter/Escape, backdrop-target click closes, search auto-focuses, `itemSelect` output, custom `[xuiSelectOption]` items. 8 tests, browser-verified (filter→Enter runs command + closes).                                                                                                           |

### Phase 7 — Date & time (6 packages) — ✅ COMPLETE (core/calendar + date-picker, date-range-picker, time-picker, date-input, date-range-input, timezone-select)

`libs/core/date-time` already has `DateAdapter` + native/Luxon implementations — reuse it as the
localization/formatting layer (Blueprint uses date-fns; the adapter is the better Angular fit).

| Blueprint         | xUI                                                           | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DatePicker`      | **✅ NEW** `@xui/date-picker` (+ **✅** `@xui/core/calendar`) | `@xui/core/calendar`: pure `buildMonthGrid(adapter, viewDate, {min,max,dateFilter,firstDayOfWeek})` → 6×7 `CalendarDay[]` (inMonth/isToday/disabled) + `weekdayLabels`/`monthYearLabel` (Intl via `getTime()`→`Date`, adapter-agnostic). 8 tests. `xui-date-picker`: inline month grid on the injected `DateAdapter` (native `Date` default); `[(selected)]`, `min`/`max`/`dateFilter`, `firstDayOfWeek`, `showActionsBar` (Today/Clear); `role=grid` + roving tabindex, full keyboard (arrows day/week, PageUp/Down month, Home/End, Enter/Space) crossing month boundaries. 10 tests, browser-verified (click + arrow/Enter selection). |
| `DateRangePicker` | **✅ NEW** `@xui/date-range-picker`                           | `xui-date-range-picker` multi-month grid (`months` 1–2) reusing `buildMonthGrid`; first click sets start, second end (hover previews via `effectiveEnd`), click-before-start restarts; interior-day strip highlight, `[(range)]` `{start,end}` model, `allowSingleDayRange`, `min`/`max`/`dateFilter`. 9 tests, browser-verified (re-select 20→28, interior highlight). Full keyboard-range deferred.                                                                                                                                                                                                                                     |
| `TimePicker`      | **✅ NEW** `@xui/time-picker`                                 | `xui-time-picker`; hour/minute (+ optional second/millisecond via `precision`) `role=spinbutton` fields with Arrow-key steppers (wrap per unit), typed entry, `useAmPm` 12h clock + AM/PM toggle; `[(value)]` on the injected `DateAdapter`. 9 tests.                                                                                                                                                                                                                                                                                                                                                                                     |
| `DateInput`       | **✅ NEW** `@xui/date-input`                                  | `xui-date-input`; text field + popover `xui-date-picker`; `formatDate`/`parseDate` (default Intl short date / `Date.parse`), best-effort typed parse on blur/Enter (unparseable keeps the value), `closeOnSelection`, `min`/`max`/`dateFilter`, `[(value)]`. 8 tests.                                                                                                                                                                                                                                                                                                                                                                     |
| `DateRangeInput`  | **✅ NEW** `@xui/date-range-input`                            | `xui-date-range-input`; two boundary fields (start → end) sharing one popover `xui-date-range-picker`; per-boundary typed parse, `[(range)]`. 6 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `TimezoneSelect`  | **✅ NEW** `@xui/timezone-select`                             | `xui-timezone-select` = `Intl.supportedValuesOf('timeZone')` (with a fallback) fed into `xui-select`, each labelled with its current `shortOffset` GMT; `[(value)]` holds the IANA id. 4 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### Phase 8 — Advanced data grid (in scope; large) — ✅ COMPLETE (8.1–8.5; 2-axis virtualization + frozen quadrant shipped; only `onCompleteRender`/header-menus/`ghostCellCount` polish deferred)

`@blueprintjs/table` → `@xui/data-table`, built on `cdk/scrolling` + the existing
`@xui/core/table`. Comparable in size to Phases 1–3 combined, so it runs as its own
sub-project after Phase 5 — but it _is_ in scope and the earlier phases should not
paint it into a corner (notably: `@xui/core/interactions` must expose the drag/resize
primitives the grid needs, and the token layer must carry grid-specific surfaces).

Sub-milestones, each independently shippable:

| #   | Milestone            | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8.1 | Core model           | **✅ `@xui/core/grid`**: `region.ts` (cell/row/column/table `Region`s, containment, equality, toggle-select), `size-store.ts` (`createGridSizeStore` — signal-backed per-index sizes with overrides, reactive `defaultSize`, cumulative `offsets` + `total`), `locator.ts` (`indexAtPosition` binary search, `positionAtIndex`, `visibleRange` with overscan). `regionBounds` materializes a region for copy. Pure logic. 24 tests.                                                                                                                                                                                                                    |
| 8.2 | Virtualized viewport | **✅ (2-axis)** `@xui/data-table` windows **rows** (verified 15 DOM rows out of 100,000; 3.6M px height; correct far-scroll window) **and columns** (viewport measured via `@xui/core/interactions` `injectElementSize` + a scroll-time `clientWidth` fallback; verified 10 of 32 columns in the DOM, window shifts on horizontal scroll). **Frozen quadrant** shipped: `numFrozenColumns` pins leading columns and `numFrozenRows` pins leading rows onto opaque raised layers (absolute + scroll-offset positioning, `z` ordered header > frozen-row > frozen-col > body — browser-verified as a full pinned corner while scrolling both axes).      |
| 8.3 | Cells & renderers    | **✅** `TemplateRef` `[xuiDataCell]` with a typed `{$implicit=value,row,column,value,rowIndex,colIndex}` context (default text cell); `role=columnheader`/`gridcell`, `align`. **Cell renderers shipped:** `XuiEditableCell` (dblclick / focus+Enter to edit, Enter commits, Esc cancels, `edited` output + two-way `value`), `XuiTruncatedFormat` (clip past `length` + "more"/"less" toggle + full-text `title`), `XuiJsonFormat` (compact/`pretty` JSON, `omitQuotes`), and a **row-header gutter** (`showRowHeader` → sticky numbered `role=rowheader` column + corner, click / shift-range / ctrl-toggle to select whole rows). Browser-verified. |
| 8.4 | Interactions         | **✅** column resizing (drag the divider → size store), **auto-fit on double-click** (measures header + rendered cells), **column reorder** (drag the header → permutes `columnOrder` + carries widths, `columnReorder` output; pointer-based rather than `cdk/drag-drop` to fit the absolutely-positioned/virtualization-ready layout and stay jsdom-testable), tri-state header sort, focused cell + arrow-key nav with scroll-into-view, and **region multi-select** (click / shift-range / ctrl-cmd-toggle / shift+arrows / ⌘A / Esc, `selection` model). Browser-verified.                                                                        |
| 8.5 | Integration          | **✅** `sortChange`/`cellClicked`/`copied`/`columnReorder` outputs, `role="grid"` + `aria-row/colcount` + `aria-row/colindex` + `aria-sort` + `aria-selected`/`aria-multiselectable`, **copy-to-clipboard** (⌘/Ctrl+C → TSV honoring the displayed column order; disjoint regions leave gaps blank), Storybook incl. the 100k-row perf story and a Selection-and-Copy story (browser-verified). `onCompleteRender`, header menus, `ghostCellCount` **deferred**.                                                                                                                                                                                       |

Explicitly **not** ported: Blueprint's `table-dev-app` harness, and the deprecated `Table`
(v1) API — `@xui/data-table` targets `Table2` semantics only.

### Phase 9 — Optional / labs

`Box`, `Flex`, `Slot` (`@blueprintjs/labs`) — mostly redundant with Tailwind utilities.
Recommend skipping `Box`/`Flex`; a `xuiSlot`-style content-merge directive may be worth it for
composition (Angular's `ngProjectAs` covers most cases).

**Totals:** ~13 upgrades + ~57 new packages + ~10 core entrypoints (excluding Phase 8).

---

## 4b. Phase 10 — ng-zorro-antd (Ant Design) additions — ✅ COMPLETE (Tier 1 + Tier 2)

Beyond Blueprint parity, a gap analysis against `ng-zorro-antd` surfaced components Ant
Design has that Blueprint (and therefore xui) lacked. Ant-specific layout primitives
(`grid`/`layout`/`space`/`flex`), infra (`i18n`/`pipes`/`cdk`), `code-editor` (Monaco), and
components xui already covers (`auto-complete`≈`suggest`, `message`/`notification`≈`sonner`,
`empty`≈`non-ideal-state`) were **excluded**. All ported components keep xui's
Blueprint/GitHub theme (Tailwind tokens), signals, OnPush/zoneless, and the standard DoD
(story + tests + browser-verified). 15 new packages, ~92 tests.

**Tier 1 (common):**

| Package             | Notes                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `@xui/avatar`       | Image / initials / icon avatar with load-error fallback; `XuiAvatarGroup` overlap + `max` → `+N`. 9 tests. |
| `@xui/statistic`    | Big-number stat (prefix/suffix/precision) + live `XuiCountdown` (token format, `finished`). 11 tests.      |
| `@xui/descriptions` | Key/value grid, `column`/`layout`/`bordered`, per-item `span`. 5 tests.                                    |
| `@xui/result`       | Status page (success/error/warning/info + 404/403/500), inline SVG glyphs, `[xuiResultExtra]`. 5 tests.    |
| `@xui/rate`         | Star rating, `allowHalf`/`allowClear`, hover preview, arrow keys, `role=slider`. 6 tests.                  |
| `@xui/timeline`     | Vertical timeline, colored dots, left/right axis. 3 tests.                                                 |
| `@xui/steps`        | Stepper/wizard, derived finish/process/wait + per-step override, clickable, horizontal/vertical. 5 tests.  |
| `@xui/pagination`   | Prev/next + numbered pages with ellipses (`paginationRange`), size changer, item summary, simple. 9 tests. |

**Tier 2 (heavier):**

| Package             | Notes                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `@xui/splitter`     | Resizable panes, N-panel, min/max, horizontal/vertical, gutter drag, `sizeChange`. 4 tests.                     |
| `@xui/carousel`     | Slides with arrows/dots/keyboard, autoplay (hover-pause via self-cleaning `effect`), `scrollx`/`fade`. 6 tests. |
| `@xui/color-picker` | SV square + hue + alpha drag, hex field, presets; pure `color-utils` (hsv/rgb/hex). 11 tests. Browser-verified. |
| `@xui/tree-select`  | Tree in a dropdown, single value or multi chips, expand/collapse. 4 tests.                                      |
| `@xui/cascader`     | Cascading column select; leaf commits the path; reopens at the committed path. 4 tests.                         |
| `@xui/transfer`     | Dual list-box, checkboxes + select-all, move buttons, per-side search. 5 tests.                                 |
| `@xui/upload`       | Button or drag-drop zone, file list with size/progress/status + remove, `selected` output. 6 tests.             |

**Deferred / possible follow-ups:** checkbox parent/child cascade in `tree-select`, `alternate`
timeline mode, circular `progress`, and folding `@xui/pagination` into `@xui/data-table`.

---

## 4c. Phase 11 — spartan (shadcn-for-Angular) additions — ✅ COMPLETE (Tier 1 + Tier 2)

A gap analysis against `spartan/ui` (`helm` styled layer, CDK-based) surfaced a handful of
primitives it has that xui lacked. Most of spartan overlaps what xui already ships — skipped as
already covered: `collapsible`≈`collapse`, `input-group`≈`control-group`, `toggle-group`≈
`segmented-control`, `native-select`≈`html-select`, `separator`≈`divider`, `resizable`≈`splitter`,
`sheet`≈`drawer`, `empty`≈`non-ideal-state`, `command`≈`omnibar`, `autocomplete`/`combobox`≈
`suggest`/`multi-select`, `hover-card`≈`popover` (hover kind), `typography`≈`text`. 8 new
packages, 33 tests, all browser-verified.

**Tier 1 (clean, high-utility):**

| Package             | Notes                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `@xui/kbd`          | Keyboard-key cap directive (`[xuiKbd]`), sm/md/lg. Pairs with `@xui/hotkeys`. 3 tests.                           |
| `@xui/aspect-ratio` | Ratio-locked container via CSS `aspect-ratio`; stretches/covers projected media. 3 tests.                       |
| `@xui/scroll-area`  | Scroll container with slim theme-aware scrollbars (WebKit + Firefox); vertical/horizontal/both. 3 tests.        |
| `@xui/input-otp`    | Segmented OTP/PIN; one hidden input drives native caret/paste/autofill, visual slots, `mask`, `completed`. 7 tests. Browser-verified. |
| `@xui/accordion`    | Multi-item expand/collapse; single- or `multiple`-open; CSS grid-rows height animation. `value` model. 5 tests. Browser-verified. |

**Tier 2 (heavier):**

| Package               | Notes                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `@xui/alert-dialog`   | Modal confirm/destructive dialog; `open` model, `confirmed`/`cancelled`, Escape/backdrop dismiss, focus. 5 tests. Browser-verified. |
| `@xui/menubar`        | Desktop menu bar on CDK `CdkMenuBar` (roving focus, arrow-nav, hover-switch); dropdowns reuse `@xui/menu`. 3 tests. Browser-verified. |
| `@xui/navigation-menu`| Hover mega-menu; items open a shared viewport panel (padded bridge keeps it reachable); `href` items are links. 4 tests. Browser-verified. |

**Deferred / not ported:** `sidebar` (app-shell scale), `item` (≈`card-list`), a standalone inline
`calendar` (already inside `date-picker`), and entrance/exit animations on `alert-dialog` /
`navigation-menu` (no animation dep in the workspace).

---

## 5. Execution model

**Per-component loop** (repeatable, ~½–1 day for simple, 2–4 days for overlay/date components):

```bash
nx g @xui/tools:library <name> --generate=component --story
```

1. Port the Blueprint props table → signal inputs; drop React-only props (`elementRef`,
   `*Renderer` → `TemplateRef`, `children` → content projection).
2. Extract non-trivial behavior into `@xui/core/<name>` first, with its own tests.
3. Implement CVA variants against the Phase 0 tokens; cross-check visually against
   `pnpm --dir /Users/jiu/Projects/blueprint storybook` (Blueprint's own Storybook) or its docs.
4. Write the spec (6 canonical cases) and the story (variant matrix + dark mode).
5. `nx run-many -t lint test build -p <name>` green; add README row + `tsconfig.base.json` path
   (generator does this once fixed).
6. Chromatic snapshot review on the PR.

**Branching:** one PR per component (or per tight cluster, e.g. navbar + its 3 sub-directives).
Conventional commits — `feat(select): add multi-select component`.

**Ordering constraints:**

```
Phase 0 ──► Phase 1 ──► Phase 2
   └──► 0.2 overlay ──► Phase 3 ──► Phase 6 (select) ──► Phase 7 (datetime)
                            └────► Phase 4 (forms) ──┘
                            └────► Phase 5
```

**Release:** keep the current `nx release` + `2.0.0-alpha.x` train; publish each phase as an alpha
bump, cut `2.0.0-beta.0` after Phase 5, `2.0.0` after Phase 7.

---

## 6. Risks & open decisions

| #   | Item                                                                                   | Recommendation                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Toast**: `@xui/sonner` (ngx-sonner wrapper) vs a native `@xui/toast`                 | Build native `@xui/toast` on `@xui/core/overlay`; freeze `@xui/sonner` and mark it deprecated in the README. Removes a third-party runtime dep from the core story. |
| 2   | **Icons**: Blueprint ships ~500 custom icons; xUI uses `@ng-icons` (Material)          | Stay on `@ng-icons` — do not port Blueprint's icon set. Document the icon-name mapping for anyone migrating.                                                        |
| 3   | **Intent naming**: Blueprint `danger`/`none` vs xUI `error`/undefined                  | Keep xUI names; add a doc table. Do not add aliases (double API surface).                                                                                           |
| 4   | **Popover engine**: `cdk/overlay` vs Floating UI (what Blueprint's `PopoverNext` uses) | `cdk/overlay` — already a dependency, SSR-safe, integrates with `cdk/a11y` focus trapping.                                                                          |
| 5   | **`@angular/animations`**                                                              | Avoid; use Web Animations API / CSS transitions so packages stay dependency-light and zoneless-clean.                                                               |
| 6   | **Test runner split** — Jest for libs, Vitest for the Storybook addon                  | Keep both: Jest for unit specs (existing infra), Vitest+Playwright only for Storybook interaction/a11y runs. Don't migrate mid-project.                             |
| 7   | **Phase 8 (data grid)** scope                                                          | Confirmed in scope. Runs as its own sub-project after Phase 5; earlier phases must not paint it into a corner (see Phase 8).                                        |
| 8   | **Bundle/dep hygiene**                                                                 | Each package declares exact peer deps; add a CI check that a package's `package.json` peers match its actual imports.                                               |

---

## 7. Immediate next steps

1. ~~Land Phase 0.1 — extract `theme.css`, add surface/border/muted/elevation tokens, purge raw
   Tailwind palette usage from the 14 existing packages, add the Design Tokens story.~~ ✅
2. ~~Land Phase 0.3 — fix `xui-library`/`xui-component`/`xui-story` generators + spec template +
   `libs/testing`.~~ ✅
3. ~~Backfill specs for the 14 existing packages against the new conventions — it validates the
   test harness before 57 new packages depend on it.~~ ✅ (118 tests)
4. ~~Land Phase 0.2 — `@xui/core/overlay` and `@xui/core/interactions` with tests (unblocks
   Phase 3).~~ ✅ (plus `@xui/core/a11y`; 53 tests in `core`, and a `Core/Overlay` Storybook page
   covering the positioning jsdom cannot check)
5. ~~Start Phase 1 in component order: `text` → `icon` → `divider` → `spinner` → `progress-bar` →
   `skeleton` → `link`.~~ ✅ (242 tests workspace-wide)
6. ~~Phase 2 — layout & content: `card` → `card-list` → `section` → `callout` → `collapse` →
   `entity-title` → `non-ideal-state` → `navbar` → `overflow-list` → `breadcrumbs`.~~ ✅ (356 tests
   workspace-wide)
7. ~~Phase 3 — overlays: `popover` → `tooltip` → `menu` → `context-menu` → `dialog` → `alert` →
   `drawer` → `toast` → `panel-stack`.~~ ✅ (all 10; 439 tests workspace-wide, 42 projects green,
   every surface browser-verified). Deferred within the phase: popover arrow, tooltip nothing,
   menu checkbox/radio items, context-menu imperative opener, dialog multistep, panel-stack
   keep-mounted mode.
8. Phase 4 — forms (14 packages): ~~`textarea` → `switch` → `radio` → `numeric-input` → `file-input`
   → `control-group` → `html-select` → `segmented-control` → `checkbox` (up) → `input`/`InputGroup`
   (up) → `form-field` (up) → `slider` (**NEW**) → `button-group` (up) → `button` (up) →
   `editable-text` (**NEW**) → `tag-input` (**NEW**) → `control-card` (**NEW**)~~ ✅ **Phase 4
   COMPLETE (17 components).**
9. Phase 5 — data display & navigation: ~~`tabs` (**NEW**) → `table` (up) → `resize-sensor` (core,
   pre-existing) → `tag` (**NEW**) → `tree` (**NEW**) → `hotkeys` (**NEW**)~~ ✅ **Phase 5 COMPLETE
   (6 packages).**
10. Phase 6 — select family: ~~`@xui/core/query` (headless engine) → `select` → `multi-select` →
    `suggest` → `omnibar`~~ ✅ **Phase 6 COMPLETE (5 packages).** Everything composes the Phase 3
    popover + the new `@xui/core/query` engine (signal-driven filtered list + active-item nav);
    `multi-select` reuses `@xui/tag` chips, all share the `[xuiSelectOption]` custom-item template.
11. Phase 7 — date & time: ~~`@xui/core/calendar` (pure month-grid engine) → `date-picker` →
    `time-picker` → `timezone-select` → `date-input` → `date-range-picker` → `date-range-input`~~ ✅
    **Phase 7 COMPLETE (6 UI packages + core/calendar).** All build on the existing
    `@xui/core/date-time` `DateAdapter` (native `Date` default, generic `T`); `Intl` handles
    locale-aware labels via `getTime()`→`Date` so it stays adapter-agnostic.
12. Phase 8 — advanced data grid: **8.1 `@xui/core/grid`** (region/size/locator model + `regionBounds`,
    pure, 24 tests) ✅ and **`@xui/data-table`** — a row-virtualized grid on that model (browser-verified
    at 100k rows: 15 DOM rows, correct far-scroll window, sticky header, tri-state sort). **Interactions
    ✅ (8.4/8.5):** resizable columns, auto-fit on double-click, column reorder (pointer drag → carries
    widths, `columnReorder`), region multi-select (click / shift-range / ctrl-cmd-toggle / shift+arrows /
    ⌘A / Esc, `selection` model), copy-to-clipboard (⌘/Ctrl+C → TSV honoring displayed order),
    `[xuiDataCell]` templates (`$implicit` = cell value), `role=grid` + `aria-selected`/`aria-multiselectable`
    a11y. **Cell renderers ✅ (8.3):** `XuiEditableCell` (inline edit — Enter commits, Esc cancels,
    `edited` output), `XuiTruncatedFormat` (clip + more/less + title), `XuiJsonFormat` (pretty/omitQuotes),
    and a **row-header gutter** (`showRowHeader` → sticky numbered column, click / shift / ctrl to select
    whole rows). All browser-verified. **Big-grid structure ✅ (8.2):** column virtualization (viewport
    measured via `injectElementSize` + a scroll-time `clientWidth` fallback; 10/32 columns in the DOM) and
    the **frozen quadrant** (`numFrozenColumns` + `numFrozenRows` pin leading columns/rows on opaque raised
    layers — browser-verified as a pinned corner scrolling both axes). **Phase 8 complete** (46 data-table
    tests). Only `onCompleteRender`, header menus, and `ghostCellCount` polish remain deferred. Phase 9
    (labs) is out of scope per the user.

---

## 8. Accessibility & RTL hardening

A cross-cutting audit of the finished library (RTL, Tab focus, a11y semantics) and the fixes it
produced. Everything below is browser-verified in Storybook plus covered by unit tests.

### 8.1 Focus indicators

- **The `focus:outline-none focus-visible:outline-*` idiom painted nothing.** `:focus-visible`
  implies `:focus`, so in Tailwind 4 the `outline-none` half won and `outline-style` stayed `none`
  while width/colour were set — 13 components (tabs, tree, slider, date-picker, control-card,
  data-table, …) had an invisible keyboard focus ring. The suppressor is now dropped wherever a
  `focus-visible:` replacement exists. It is kept only on text fields that deliberately swap the
  ring for a `focus:border-focus` border (input, textarea, suggest, select trigger, transfer search).
- **`libs/core/styles/theme.css` gained a baseline `:focus-visible` rule** (2px `--focus` outline,
  2px offset) so a focusable element is never left with no indicator. Utilities outrank it, so any
  component drawing its own ring still wins.
- Rings added where there were none at all: menubar triggers, navigation-menu triggers and links,
  the pagination page-size select, transfer search, clickable steps, every color-picker control,
  and both upload controls.

### 8.2 Keyboard access

| Component      | Was                                                        | Now                                                                                     |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `transfer`     | `<li (click)>` — mouse only, a11y lint rules suppressed     | `role="listbox"` + `aria-multiselectable`, one tab stop per side, `aria-activedescendant`, Arrow/Home/End/Space/Enter; select-all is a real tri-state `role="checkbox"` button |
| `color-picker` | S/V square, hue and alpha strips were `<div (mousedown)>`   | Strips are `role="slider"` with `aria-value*` and arrow keys; the square is a focusable group with two-axis arrow stepping (Shift = ×10) |
| `splitter`     | `role="separator"` with no tabindex, no keys, no values     | Focusable separator with `aria-valuenow/min/max`, Arrow (Shift = 10%) and Home/End        |

### 8.3 Modal semantics

`@xui/core/overlay` now emits `aria-modal="true"` and marks every sibling of the CDK overlay
container `inert` while a modal is open, undoing it before focus is restored. `modal` defaults to
`trapFocus && hasBackdrop`, so dialog/drawer become modal while a focus-trapping popover (no
backdrop, closes on outside click) does not — `inert` would swallow the clicks it listens for.
Carousel slides that are `aria-hidden` are now `inert` too, so they cannot hold a tab stop.

### 8.4 RTL

The library had **no direction support at all** — no `Directionality` anywhere, no `dir` in any
spec, no way to even view RTL in Storybook.

- **`@xui/core/a11y` gained the direction primitives**: `injectXDirection()` (a signal over
  `@angular/cdk/bidi`), `arrowDirection` / `arrowDirectionOnAxis` (WAI-ARIA's rule that horizontal
  arrows mirror in RTL and vertical ones never do), `arrowValueDirection` (the same for
  value widgets, where ArrowUp *increases* rather than meaning "previous"), and `inlineFraction`
  for pointer maths along the inline axis.
- **Keyboard fixed** in tabs, tree, slider, rate, carousel, date-picker, data-table and splitter.
- **Geometry fixed**: the tabs indicator (`insetInlineStart` measured from the right edge in RTL),
  slider handle/fill/ticks/labels, carousel track transform, tree indentation
  (`padding-inline-start`), colour-picker handles and gradients, and pointer maths in slider,
  splitter and colour picker.
- **Physical Tailwind utilities swapped for logical ones** across 39 files (`ml/mr/pl/pr` →
  `ms/me/ps/pe`, `border-l/r` → `border-s/e`, `rounded-l/r` → `rounded-s/e`, `text-left/right` →
  `text-start/end`, affix `left-0`/`right-0` → `start-0`/`end-0`).
- **CDK overlays are told the direction**, so `*-start` placements anchor to the right edge in RTL.
- **Storybook has a Direction toolbar toggle** (`globalTypes.direction`) that sets `dir` on
  `<html>`, and `@xui/testing` exports `provideDirection('rtl')` for specs.

**Known limits.** `@xui/data-table` positions virtualized cells with JS-computed physical `left`
and `sticky left-0` frozen columns; its keyboard navigation is direction-aware but the *layout*
is still LTR-only. Directional API names (`drawer position="left|right"`, `button align`,
`timeline mode`, `data-table align`, the overlay `placement` union) stay physical — renaming them
to `start`/`end` is a breaking change worth its own pass. The hardcoded English `aria-label`s
(~38 of them) still have no override hook.

### 8.5 axe findings

axe-core (via the Storybook a11y addon) was run over all 270 stories before and after. Semantic
violations fixed:

| Violation                                | Where                                  | Fix                                                                                              |
| ---------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `button-name` (critical)                 | `<xui-checkbox>projected label</…>`    | Projected label content lives in a sibling span, so the box now points `aria-labelledby` at it     |
| `aria-allowed-attr` (critical)           | `<button xuiCard interactive selected>` | `aria-selected` is invalid on a button — emit `aria-pressed` (button) / `aria-current` (link)      |
| `aria-input-field-name` (serious)        | `<xui-rate>`                            | `role="slider"` had no name; defaults to "Rating", overridable, plus `aria-valuetext` ("3 of 5")   |
| `role-img-alt` (serious)                 | `<xui-avatar src>` with no `alt`        | An avatar with no name is decorative: drop `role="img"`, add `aria-hidden`                         |
| `aria-allowed-attr` (critical, 42/cell)  | date-picker + date-range-picker day cells | `aria-selected` moved from the day `<button>` onto its `<td>`, which is the gridcell               |
| `aria-allowed-attr` (critical)           | `[xuiPopover]` on a roleless `<div>`     | The directive now only emits `aria-expanded`/`aria-haspopup` when the host has a role that allows them |
| `button-name` (critical)                 | `<xui-select>` / `<xui-timezone-select>` | A `combobox` takes its *value* from content, so it needs a real label: new `aria-label`/`aria-labelledby` inputs, defaulting to the placeholder |
| `empty-table-header` (minor)             | data-table row-header corner cell        | Labelled "Row number"                                                                              |
| `link-name`, `button-name` (story-level) | breadcrumb + checkbox colour matrices   | Icon-only links and colour swatches now carry `aria-label` in the stories                          |

**Still open — `color-contrast`.** ~15 stories report serious contrast failures on the intent
palette (badge, tag, button, checkbox colour matrices, tree secondary labels, data-table
formatters). These are design-token decisions, not component bugs: the `*-subtle`/`*-emphasis`
ramp does not clear 4.5:1 for every intent. Fixing them means re-tuning the ramp in
`libs/core/styles/theme.css` and re-reviewing every Chromatic snapshot, so it is left as its own
piece of work. It is the last thing standing between the suite and flipping the Storybook a11y
addon from `test: 'todo'` to `'error'` in CI.
