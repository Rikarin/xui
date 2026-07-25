---
name: xui
description: >-
  Manages xUI, the Angular 22 + Tailwind 4 UI library - adding, composing, fixing, theming and
  debugging UI built from the `@xui/*` packages and the headless `@xui/core/*` entrypoints.
  Provides project context, component APIs and usage examples. Applies to any project that depends
  on `@xui/core` or an `@xui/<component>` package, and to work inside the xUI monorepo itself
  (`libs/ui`, `libs/core`, `apps/ui-storybook`). Also triggers for "add an xUI component",
  "theme xUI", "xuijs.org" or "@xui/…".
user-invocable: false
allowed-tools:
  - Bash(pnpm nx g @xui/tools:*)
  - Bash(npx nx g @xui/tools:*)
  - Bash(pnpm nx build mcp)
---

# xUI

xUI is an Angular 22 UI library styled with Tailwind 4. It is **not** a copy-in registry like
shadcn or spartan/ui: every component is a published npm package you install and import.

Three layers:

- **`@xui/core`** - the `xui()` class merger (clsx + tailwind-merge), `createInjectionToken`, and
  `@xui/core/styles/theme.css`, the design-token layer everything styles against.
- **`@xui/core/<name>`** - headless behaviour/a11y primitives (`overlay`, `forms`, `a11y`, `query`,
  `interactions`, `calendar`, `date-time`, `grid`, `table`, …). No styling.
- **`@xui/<name>`** - ~90 styled packages (`@xui/button`, `@xui/dialog`, `@xui/data-table`, …).
  Each is a `cva()` variant map merged through `xui()`, exposed on the host element.

Components are standalone directives and components using signal APIs, `OnPush`, and zoneless
change detection. Prefer a directive on a native element (`<button xuiButton>`) where the native
element is semantically right; a component owns structure or state (`<xui-dialog>`).

## Discovery: never guess a selector

The library has ~90 packages and the docs site covers two of them. The source is the API, and the
[`@xui/mcp`](mcp.md) server exposes it. Before writing any markup:

1. `xui_meta` - version, index provenance, every valid component name.
2. `xui_components_search` with what you need ("date range", "toast", "resizable panel").
3. `xui_components_get` - selectors, signal inputs with types and defaults, outputs, variant axes,
   exported types, the config-token API.
4. `xui_components_get` with `extract: "examples"` - the Storybook templates for that package.

Without the MCP server, read the source directly - it is the same information:

- API: `libs/ui/<name>/xui/src/lib/<name>.ts` and the barrel `src/index.ts`.
- Examples: `apps/ui-storybook/stories/<name>.stories.ts`.
- Tokens: `libs/core/styles/theme.css`.

## Principles

1. **Use an existing package first.** Search before writing custom markup; the catalogue covers
   overlays, data grid, date/time, tree, transfer, charts, editors and node graphs.
2. **Compose, do not reinvent.** Build dialogs, forms and dashboards out of `@xui/*` pieces.
3. **Use the variant inputs, not custom classes.** `variant`, `size`, `color`, `minimal`, `compact`
   exist on the components that have them - check the variant axes before reaching for a class.
4. **Semantic tokens only.** `bg-surface`, `text-foreground-muted`, `border-error-muted` - never a
   raw palette class such as `bg-zinc-800`, which cannot follow the active theme.
5. **Import through the barrel.** Every package exports `Xui<Name>Imports`; put that in the
   standalone component's `imports`.

## Critical rules

Read the rule file before doing the related work:

- **`rules/styling.md`** - `xui()`, the `class` input contract, semantic tokens, layout classes,
  dark mode, no manual z-index on overlays.
- **`rules/composition.md`** - which children belong inside which container, overlays and their
  triggers, dialogs, menus, tables, and the components to use instead of hand-rolled markup.
- **`rules/forms.md`** - `<xui-form-field>` with `<xui-error>` / `<xui-hint>`, reactive forms,
  `ControlValueAccessor`, and the `@xui/core/forms` error-state plumbing.
- **`rules/icons.md`** - `@ng-icons`, `provideIcons` registration, `<ng-icon xui>` sizing, and the
  `icon="matPersonRound"` string inputs components take.
- **`rules/authoring.md`** - conventions for adding or changing a package _inside_ the monorepo:
  signal APIs, CVA + config token, specs, stories, and what "done" means.
- **`packages.md`** - installing, the required stylesheet imports, and the import barrels.
- **`theming.md`** - the token scale, deriving ramps, scoped and dark themes, re-theming.
- **`generators.md`** - `@xui/tools` generators for new packages, components, directives, stories
  and `@xui/core` entrypoints.
- **`mcp.md`** - the `@xui/mcp` tools, resources and prompts.

## Key patterns

```html
<!-- Directive on a native element, variant inputs, no custom classes -->
<button xuiButton color="error" variant="outline" size="sm">Delete</button>

<!-- Loading is an input, not a spinner you compose yourself -->
<button xuiButton [loading]="saving()">Save</button>

<!-- Overlay: a trigger directive plus an ng-template -->
<button xuiButton [xuiMenuTriggerFor]="menu">File actions</button>
<ng-template #menu>
  <xui-menu>
    <button xuiMenuItem icon="matContentCopyRound">Duplicate</button>
    <xui-menu-divider />
    <button xuiMenuItem icon="matDeleteRound" intent="error">Delete</button>
  </xui-menu>
</ng-template>

<!-- Two-way state with model() inputs -->
<xui-dialog [(isOpen)]="open" title="Edit profile">
  <xui-dialog-body>…</xui-dialog-body>
  <xui-dialog-footer>
    <button xuiButton variant="ghost" (click)="open.set(false)">Cancel</button>
  </xui-dialog-footer>
</xui-dialog>
```

```ts
@Component({
  selector: 'app-profile',
  imports: [XuiButtonImports, XuiDialogImports, XuiFormFieldImports, XuiInputImports],
  providers: [provideIcons({ matPersonRound })],
  template: `…`
})
export class Profile {
  readonly open = signal(false);
}
```

## Component selection

| Need                   | Package(s)                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Action                 | `button`, `button-group`, `segmented-control`, `hotkeys`                                                                  |
| Text / number input    | `input`, `textarea`, `numeric-input`, `input-otp`, `editable-text`, `file-input`, `upload`                                |
| Choice input           | `select`, `multi-select`, `suggest`, `cascader`, `tree-select`, `radio`, `checkbox`, `switch`                             |
| Sliders and ratings    | `slider`, `rate`, `color-picker`                                                                                          |
| Date and time          | `date-input`, `date-picker`, `date-range-input`, `date-range-picker`, `time-picker`, `timezone-select`                    |
| Form layout            | `form-field`, `label`, `control-group`, `control-card`                                                                    |
| Data display           | `table`, `data-table`, `descriptions`, `statistic`, `card`, `card-list`, `tag`, `badge`, `kbd`, `avatar`                  |
| Navigation             | `navbar`, `navigation-menu`, `menubar`, `breadcrumb`, `tabs`, `pagination`, `steps`, `panel-stack`                        |
| Overlays               | `dialog`, `alert-dialog`, `alert`, `drawer`, `popover`, `tooltip`, `context-menu`, `menu`, `omnibar`                      |
| Feedback               | `toast`, `callout`, `progress-bar`, `spinner`, `skeleton`, `result`, `non-ideal-state`, `status`                          |
| Layout / containers    | `section`, `divider`, `collapse`, `accordion`, `splitter`, `scroll-area`, `aspect-ratio`, `overflow-list`, `dock-manager` |
| Selection and transfer | `transfer`, `tree`, `timeline`, `carousel`                                                                                |
| Typography             | `text` (`xuiText`, `xuiHeading`, `xuiCode`, `xuiList`), `entity-title`, `link`                                            |
| Visualisation          | `echarts`, `konva`, `node-graph`, `rich-text-editor`                                                                      |
| Icons                  | `icon` (`@ng-icons`)                                                                                                      |

Confirm the exact selectors with `xui_components_get` - this table is a map, not an API.

## Workflow

### Using xUI in an application

1. **Check what is installed** - `package.json` for `@xui/*`, and whether
   `@xui/core/styles/theme.css` is imported. If not, follow `packages.md`.
2. **Find the component** - `xui_components_search`, then `xui_components_get`.
3. **Install it** - `xui_components_dependencies` prints the exact `pnpm add` line and the
   stylesheet imports the app needs (overlay surfaces also need
   `@angular/cdk/overlay-prebuilt.css`).
4. **Compose it** - import the `Xui<Name>Imports` barrel, follow `rules/composition.md`.
5. **Style it** - variant inputs first, then semantic tokens through the `class` input.
6. **Register icons** - every `<ng-icon>` name must be passed to `provideIcons(...)`.

### Working inside the xUI monorepo

1. **Scaffold** with the generators (`generators.md`) rather than copying a package by hand.
2. **Follow `rules/authoring.md`** - signal APIs, CVA + config token, `class` merge, a11y.
3. **Story and specs** are part of the change, not a follow-up.
4. **Verify**: `pnpm nx run-many -t lint test build` and `pnpm nx format:write`.
5. **Refresh the index** with `xui_index_refresh` so later MCP lookups see your new component.
