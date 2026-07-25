# Installing and importing xUI

## Packages

| Package            | What it is                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@xui/core`        | Required by everything: the `xui()` class merger, `createInjectionToken`, the theme                                                                                       |
| `@xui/core/<name>` | Headless primitives - `overlay`, `forms`, `a11y`, `query`, `interactions`, `calendar`, `date-time`, `date-time-luxon`, `grid`, `table`, `checkbox`, `label`, `form-field` |
| `@xui/<name>`      | A styled component package - install only the ones you use                                                                                                                |
| `@xui/tools`       | Nx generators, only needed inside the monorepo                                                                                                                            |
| `@xui/mcp`         | The MCP server for coding agents                                                                                                                                          |

`xui_components_dependencies` prints the exact install line for a component, including the other
`@xui` packages it peer-depends on:

```bash
pnpm add @xui/core @xui/button @xui/dialog @xui/icon
```

Peer dependencies are `@angular/core`, `@angular/cdk`, `class-variance-authority` and `clsx`;
`@ng-icons/core` is needed by anything that renders an icon.

## Setup

`ng add` does the stylesheet wiring, which is the step people get wrong:

```bash
ng add @xui/core          # Angular CLI
nx add @xui/core          # Nx
```

It patches the project's global stylesheet with the theme import, the CDK overlay stylesheet and a
`@source` glob whose depth matches where that stylesheet sits. It is idempotent, adds only what is
missing, and warns instead of guessing when Tailwind is not set up or no stylesheet can be found.
Pass `--skip-overlay` if the app will use no overlay surface.

## Stylesheet

If you wire it by hand, import the token layer once, after Tailwind:

```css
@import 'tailwindcss';
@import '@xui/core/styles/theme.css';

/* Required by every overlay surface - popover, tooltip, menu, dialog, drawer, toast.
   Without it overlays render in the document flow instead of on top. */
@import '@angular/cdk/overlay-prebuilt.css';

/* Tailwind must scan the component sources for the utilities they use. */
@source '../node_modules/@xui';
```

Getting `@source` wrong is the usual cause of "the component renders unstyled": the classes live in
the published package, so Tailwind never sees them unless it is told to look.

## Importing components

Every package exports a barrel of its declarables. Put the barrel in the standalone component's
`imports` - it is the supported entry point, and it keeps working when a package gains a new
sub-component:

```ts
import { XuiButtonImports } from '@xui/button';
import { XuiFormFieldImports } from '@xui/form-field';
import { XuiInputImports } from '@xui/input';

@Component({
  selector: 'app-sign-in',
  imports: [XuiButtonImports, XuiFormFieldImports, XuiInputImports],
  template: `…`
})
export class SignIn {}
```

Individual classes (`XuiButton`, `XuiDialog`, …) are exported too, for the cases where you need the
type - injecting a child directive, typing a `viewChild`, or writing a test.

## Global defaults

Packages with variants ship a config token, so an application can change the defaults everywhere
instead of repeating inputs:

```ts
import { provideXuiButtonConfig } from '@xui/button';

bootstrapApplication(App, {
  providers: [provideXuiButtonConfig({ color: 'secondary', size: 'sm' })]
});
```

`xui_components_get` lists the `configApi` for each package (`provideXui<Name>Config` /
`injectXui<Name>Config`). The provider works at any injector level, so a feature area can override
the application default for its own subtree.
