# @xui/tools

Nx generators for working **inside the xUI monorepo** — they scaffold library
code, they do not install anything into a consumer application. All of them run
through the workspace runner:

```bash
pnpm nx g @xui/tools:<generator> [options]
```

| Generator                   | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `library`                   | a new `@xui/<name>` package (optionally with a component/directive) |
| `component`                 | a component inside an existing package                              |
| `directive`                 | a directive inside an existing package                              |
| `story`                     | a Storybook story for an existing package                           |
| `core-secondary-entrypoint` | a new headless `@xui/core/<name>` entrypoint                        |
| `update-projects`           | sync package metadata and READMEs from the workspace root           |

See `skills/xui/generators.md` in the repository for the full option tables and
the conventions the generated code follows.
