# @xui/mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for [xUI](https://xuijs.org) - it
gives a coding agent the real API of every `@xui/*` package: selectors, signal inputs, variant
axes, outputs, exported types, design tokens and working templates.

Unlike a docs scraper, the index is extracted from the library **sources** (`libs/ui/<name>/xui`,
`libs/core/styles/theme.css`, `apps/ui-storybook/stories`), so all 90 packages are covered - not
just the handful with a docs page - and the answers match the version you have installed.

## Installation

No install, via `npx`:

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

## Where the answers come from

| Mode          | When                                                                         | Behaviour                                                                              |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **workspace** | started inside an xUI checkout, or with `XUI_WORKSPACE_ROOT` pointing at one | Extracts from source on start; `xui_index_refresh` re-reads after you edit a component |
| **bundled**   | anywhere else                                                                | Answers from the index generated when the package was published                        |

`typescript` is an optional peer dependency: it is only needed for workspace mode.

## Tools

| Tool                          | Use                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `xui_components_list`         | Every package, with selectors and imports barrel (`kind: ui` or `core`)        |
| `xui_components_search`       | Find the package that covers a need ("date range", "toast", "resizable panel") |
| `xui_components_get`          | Full API of one package - `extract: api \| examples \| types \| full`          |
| `xui_components_dependencies` | Peer packages, install command and the stylesheet imports an app needs         |
| `xui_tokens_list`             | Semantic design tokens with their light/dark values and Tailwind utility       |
| `xui_docs_get`                | Documentation topics (installation, theming, dark mode, component guides)      |
| `xui_meta`                    | Version, index provenance and every valid name for the arguments above         |
| `xui_index_refresh`           | Re-extract after editing a component in a checkout                             |

## Resources

`xui://components/list`, `xui://tokens`, `xui://component/{name}/api`,
`xui://component/{name}/examples`, `xui://component/{name}/full`.

## Prompts

`xui-get-started`, `xui-implement-feature`, `xui-troubleshoot`, `xui-add-package`.

## Working on this package

```bash
pnpm nx test mcp      # parser specs
pnpm nx build mcp     # compile, then generate the bundled index into dist
```

The repo's own `.mcp.json` points at `dist/libs/mcp/src/server.js`, so run `pnpm nx build mcp`
once before using it. After that only server changes need a rebuild - component edits are picked up
by `xui_index_refresh`, because in a checkout the index is extracted live.
