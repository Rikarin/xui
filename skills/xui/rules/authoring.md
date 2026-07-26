# Authoring rules (inside the xUI monorepo)

Conventions for adding or changing a package in `libs/`.

## Layout of a package

```
libs/ui/<name>/xui/
├── src/
│   ├── index.ts              # export * + `export const Xui<Name>Imports = [...] as const`
│   ├── test-setup.ts
│   └── lib/
│       ├── <name>.ts         # component/directive
│       ├── <name>.token.ts   # injectXui<Name>Config() defaults, when it has variants
│       └── <name>.spec.ts
apps/ui-storybook/stories/<name>.stories.ts
```

Scaffold it with `pnpm nx g @xui/tools:library <name> --generate=component --story` (see
`../generators.md`); the generated package passes `lint test build` unedited.

## Code rules

- Standalone, `ChangeDetectionStrategy.OnPush`, zoneless-safe (no `setTimeout`-driven change
  detection).
- Every component sets `encapsulation: ViewEncapsulation.None`; every directive sets
  `exportAs: 'xui<Name>'` matching its class name.
- Signal APIs only: `input()`, `input.required()`, `model()`, `output()`, `computed()`,
  `linkedSignal()`, `viewChild()`, `contentChildren()`; `effect()` as a last resort.
- Boolean inputs: `input<boolean, BooleanInput>(false, { transform: booleanAttribute })`.
- Styling: a `cva()` variant map merged through `xui(...)`, applied with
  `host: { '[class]': 'computedClass()' }`, and always a `class = input<ClassValue>('')` escape
  hatch that merges rather than replaces.
- Every `cva()` map is **exported**, named `<name>Variants` for the root and
  `<name><Part>Variants` for the parts (`switchTrackVariants`), so consumers can extend a
  package's styling. The `VariantProps` type alias is exported as `Xui<Name>Variants`.
- Defaults come from a config token built with `createXConfigToken` (`@xui/core`) so applications
  can re-theme globally - `button.token.ts` is the reference:
  `export const [injectXui<Name>Config, provideXui<Name>Config] = createXConfigToken<Xui<Name>Config>('Xui<Name>Config', defaults)`.
  The provide fn merges a `Partial` over the defaults; the inject fn falls back to them.
- Prefer a directive on a native element (`<button xuiButton>`, `<table xuiTable>`) when the native
  element is semantically correct; use a component when the thing owns structure or state.
- Behaviour that is non-trivial and reusable - overlay lifecycle, roving tabindex, query/filter
  logic, date maths - goes headless into `@xui/core/<name>`; the styled package only styles it.
- Forms: implement `ControlValueAccessor` on anything with a value, reusing `@xui/core/forms` and
  `@xui/core/form-field`.
- A11y: roles and `aria-*` wired to the real focusable element, keyboard interaction per the
  WAI-ARIA APG, `FocusMonitor` / `FocusTrap` from `@angular/cdk/a11y` where relevant.
- No raw palette colours anywhere - see `styling.md`.

## Tests

Jest + `jest-preset-angular`, run zoneless. Use the `@xui/testing` harness (`render()`, `setProps`,
`click`, `press`, `type`, `expectClasses`, `expectAttributes`) - a bare `element.click()` updates
state but leaves the DOM stale in a zoneless suite. Four to eight tests per component:

1. renders and applies its base classes;
2. each variant/size/color input maps to the expected class (spot-check, do not snapshot);
3. the `class` input merges rather than replaces;
4. outputs and `model()` two-way binding fire correctly;
5. the a11y contract (role, `aria-*`, `data-state`, tabindex, disabled semantics);
6. keyboard interaction, for interactive components;
7. `ControlValueAccessor` round-trip (`writeValue` → DOM, DOM → `onChange`), for form controls.

## Story

CSF3 against `@storybook/angular-vite`: `Meta<Xui…>` + `moduleMetadata`, `argTypes` for every
variant axis, then `Default`, one story per variant axis, a colours/intents matrix and the
disabled/edge states. `apps/ui-storybook/stories/button.stories.ts` is the reference. Stories are
also the example source the MCP server extracts, so keep their templates realistic and minimal.

## Before finishing

```bash
pnpm nx run-many -t lint test build
pnpm nx format:write
```

Commits are Conventional Commits enforced by commitlint; the scope, when used, must be one of the
`scope-enum` values in `commitlint.config.mjs`.

Then run `xui_index_refresh` so the MCP server sees the new or changed component.
