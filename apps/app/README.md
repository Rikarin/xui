# Documentation site

The site at [xuijs.org](https://xuijs.org) — an Angular 22 app that documents xUI using xUI.

```bash
pnpm start                    # dev server on :4200
nx build app                  # prerender + build the Worker bundle
nx generate-docs app          # re-extract the component data only
nx preview app                # run the built Worker locally (wrangler dev)
nx deploy app                 # build, then wrangler deploy
```

## Where the content comes from

Nothing about a component is written by hand. `tools/generate-docs.ts` runs the `@xui/mcp`
extraction — the same one the MCP server answers from — over `libs/**` and the Storybook stories,
and writes `src/generated`:

| File                   | Holds                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `manifest.ts`          | The sidebar: every package with its group, title and description  |
| `loaders.ts`           | One dynamic import per package, so a page ships only its own data |
| `components/<slug>.ts` | One package's API, examples, and a compiled preview per example   |

The generated files are committed. That keeps `lint`, `test` and editor type-checking working with
no build-order dependency, and puts an API change in front of a reviewer.

**Previews are compiled from the stories.** Each story template becomes a real standalone component
in the generated file, so what renders on the page is the story rather than a copy of it. An example
is shown as source without a preview when its markup was built by an expression in the story, when
it uses a demo component the story declared for itself, or when it binds an `ng-template` context
variable — none of which survive being lifted out of Storybook.

The guide pages (`getting-started`, `theming`, `ai-agents`) are hand-written components. The token
table on the theming page is generated from `theme.css`.

## Rendering

Every page the app knows about is prerendered — 109 routes, including one per package — and served
as a static asset. Only an unknown path reaches the Worker, which server-renders a 404. See
`src/app/app.routes.server.ts`.

## Deploying

`wrangler.jsonc` points `main` at the built server bundle and binds `dist/apps/app/browser` as the
assets directory. Deploying needs a Cloudflare account with `wrangler login` already done, or a
`CLOUDFLARE_API_TOKEN` in the environment.

`nx deploy app` builds first. To check the bundle without shipping it:

```bash
wrangler deploy --dry-run --config apps/app/wrangler.jsonc
```
