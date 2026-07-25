# Using the xUI MCP server

`@xui/mcp` exposes the xUI component APIs, design tokens, docs and Storybook examples as MCP tools.
It extracts them from the library sources, so every one of the ~90 packages is covered and the
answers match the installed version - unlike the docs site, which only documents a couple of them.

## Configuration

No install (recommended):

```json
{
  "mcpServers": {
    "xui": { "command": "npx", "args": ["-y", "@xui/mcp"] }
  }
}
```

Global install:

```bash
pnpm add -g @xui/mcp
```

```json
{
  "mcpServers": {
    "xui": { "command": "xui-mcp" }
  }
}
```

Inside the xUI monorepo the checked-in `.mcp.json` already registers the server from
`dist/libs/mcp/src/server.js`; run `pnpm nx build mcp` once so that file exists.

## Where its answers come from

- **Workspace mode** - started inside an xUI checkout (or with `XUI_WORKSPACE_ROOT` pointing at
  one): the index is extracted from source at startup, and `xui_index_refresh` re-reads it after
  you edit or generate a component.
- **Bundled mode** - anywhere else: the index generated when the package was published.

`xui_meta` reports which mode is active.

## Tools

- `xui_meta` - version, index provenance, all component names, core entrypoints, docs slugs and
  token groups. Good first call, and the source of valid arguments for everything else.
- `xui_components_list` - every package with its selectors and imports barrel;
  `kind: "ui" | "core" | "all"`.
- `xui_components_search` - rank packages against a free-text need.
- `xui_components_get` - one package in full: `extract: "api" | "examples" | "types" | "full"`.
- `xui_components_dependencies` - peer packages, `pnpm add` line, and the stylesheet imports
  (including whether the CDK overlay stylesheet is required).
- `xui_tokens_list` - design tokens filtered by `group` or `query`, with light/dark values and the
  Tailwind utility each maps to.
- `xui_docs_get` - documentation topics; call without a slug to list them.
- `xui_index_refresh` - re-extract after changing a component in a checkout.

## Resources

- `xui://components/list`
- `xui://tokens`
- `xui://component/{name}/api`
- `xui://component/{name}/examples`
- `xui://component/{name}/full`

## Prompts

`xui-get-started`, `xui-implement-feature`, `xui-troubleshoot`, `xui-add-package`.

## Recommended flow

1. `xui_components_search` to pick the package.
2. `xui_components_get` (`extract: "api"`) to confirm selectors, inputs and variant axes.
3. `xui_components_get` (`extract: "examples"`) for a working template.
4. `xui_components_dependencies` before installing.
5. `xui_tokens_list` when styling anything beyond the built-in variants.

Example templates come straight from Storybook: a `${…}` span in one is Storybook arg
interpolation, not markup to copy.

If the server is not connected, fall back to the sources - `libs/ui/<name>/xui/src/lib/*.ts`,
`apps/ui-storybook/stories/<name>.stories.ts` and `libs/core/styles/theme.css` - which is exactly
what the server reads.
