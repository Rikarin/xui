# ui-storybook

The component gallery, and the closest thing the library has to an integration test suite: every
story is rendered in a real browser by `test-storybook`.

## Running

```bash
nx storybook ui-storybook        # dev server on :4400
nx build-storybook ui-storybook  # static build
nx test-storybook ui-storybook   # render every story in headless Chromium
```

`test-storybook` runs the stories through `@storybook/addon-vitest`, which turns each story into a
test: it renders, runs the story's `play` function if it has one, and fails on any error the
component throws. Playwright's Chromium is the browser, so CDK overlays, focus traps and keyboard
navigation behave as they do in a real page — none of which jsdom covers.

## Writing stories that survive the test run

**Do not name `@angular/cdk` in a story file** — not in an import, not even in a comment. Something
in the pre-bundling path fails to hand the transformed module a test context, and the file dies at
import with a misleading `Cannot read properties of undefined (reading 'replace')` inside
`convertToFilePath`. Say "the Angular CDK" in prose, and reach for CDK symbols through a `@xui/*`
package. Every other `@angular/*` entry point is fine.

**Exported classes are stories unless excluded.** A story file that exports a host component for a
decorator to import needs `excludeStories` on the meta, or Storybook lists the class in the sidebar
and tries to render it (`Class constructor X cannot be invoked without 'new'`). See
`overlay.stories.ts` and `table.stories.ts`.

**Aliased inputs have to be passed as attributes.** An input declared as
`input(null, { alias: 'aria-label' })` cannot be set through `args`: Storybook assigns args onto the
component instance, which overwrites the signal itself and makes every later change-detection pass
throw. Give the meta a `render` that writes the attribute into the template — see
`switch.stories.ts`.
