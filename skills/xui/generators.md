# The `@xui/tools` generators

These run inside the xUI monorepo only - they scaffold library code, they do not install anything
into a consumer application. All of them go through the workspace runner:

```bash
pnpm nx g @xui/tools:<generator> [options]
```

## `library` - a new `@xui/<name>` package

```bash
pnpm nx g @xui/tools:library split-button --generate=component --story
```

| Option          | Meaning                                                           |
| --------------- | ----------------------------------------------------------------- |
| `name`          | kebab-case package name (positional)                              |
| `generate`      | `component` \| `directive` \| `none` - what to scaffold inside it |
| `story`         | also generate the Storybook story (default `true`)                |
| `documentation` | also generate the ng-doc page (default `true`)                    |
| `description`   | description for the generated documentation page                  |

Produces `libs/ui/<name>/xui` with the `Xui<Name>Imports` barrel, the `@xui/<name>` package.json
(peer deps and version taken from `@xui/core`), jest/tsconfig/eslint wiring, and the story in
`apps/ui-storybook/stories/`. The output passes `lint test build` unedited - keep it that way.

## `component` / `directive` - add to an existing package

```bash
pnpm nx g @xui/tools:component --project=split-button --componentName=split-button-menu
pnpm nx g @xui/tools:directive --project=button --componentName=button-shine
```

Emits `<name>.ts` (class `Xui<Name>`), a `<name>.token.ts` config token, and a `<name>.spec.ts`
with working tests plus `it.todo` markers for the variant and a11y assertions to fill in.

## `story` - add a Storybook story

```bash
pnpm nx g @xui/tools:story --project=split-button --componentName=split-button --kind=component
```

`kind` is `component` for an element selector, `directive` for an attribute directive - it decides
the template the story renders.

## `core-secondary-entrypoint` - a new `@xui/core/<name>`

```bash
pnpm nx g @xui/tools:core-secondary-entrypoint gestures
```

Use this for behaviour that is reusable and non-trivial - overlay lifecycle, roving tabindex,
query/filter logic, date maths - so the styled package only styles it.

## `update-projects`

```bash
pnpm run update-projects
```

Propagates the root `package.json` metadata and the README sections into every per-package
`package.json` and `README.md`. Run it after changing shared metadata, not per feature.

## After generating

1. Implement the component following `rules/authoring.md`.
2. `pnpm nx run-many -t lint test build`, then `pnpm nx format:write`.
3. `xui_index_refresh` so the MCP server picks the new package up.
