# Theming xUI

Everything is styled with semantic tokens declared in `@xui/core/styles/theme.css` and mapped onto
Tailwind utility namespaces with `@theme inline`. `--surface` becomes `bg-surface`, `text-surface`,
`border-surface`; `--foreground-muted` becomes `text-foreground-muted`, and so on.

`xui_tokens_list` returns the live set with light and dark values. The groups:

| Group     | Tokens                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Surfaces  | `background`, `surface`, `surface-raised`, `surface-overlay`, `surface-sunken`, `surface-inset`, `muted`, `muted-foreground`                     |
| Text      | `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-on-emphasis`                                                                  |
| Borders   | `border`, `border-muted`, `border-strong`                                                                                                        |
| Intents   | `primary`, `secondary`, `success`, `error`, `warning`, `info` - each with `-darker`, `-lighter`, `-foreground`, `-subtle`, `-muted`, `-emphasis` |
| State     | `focus`, `link`, `link-hover`, `selection`, `hover-overlay`, `active-overlay`                                                                    |
| Elevation | `elevation-0` … `elevation-4`, `elevation-overlay` (a namespace of its own, separate from Tailwind's `shadow-*`)                                 |
| Motion    | `duration-fast`, `duration-base`, `duration-slow`                                                                                                |
| Controls  | `control-height-sm\|md\|lg`, `control-padding-sm\|md\|lg` - the density every control shares; `radius-control`                                   |
| Chrome    | `hairline`, `hairline-strong` - seams between chrome pieces; `highlight` - a raised surface's top bevel                                          |

## Which step to use

- `--<intent>` + `--<intent>-foreground` - a filled control (`bg-primary text-primary-foreground`).
- `--<intent>-darker` / `-lighter` - hover and border states of that filled control.
- `--<intent>-subtle` - a tinted background: callouts, tags, selected rows.
- `--<intent>-muted` - the border that pairs with a `subtle` background.
- `--<intent>-emphasis` - text or an icon that stays legible on `subtle`.

`subtle`, `muted`, `emphasis`, `darker` and `lighter` are **derived** from the intent base and
`--background` with `oklch()` and `color-mix()`. Overriding one intent re-colours its whole ramp.

## Control density

Every control - button, input, select, date field, picker - sizes itself from one scale, so
anything on the same row lines up:

| step         | height | padding | type        |
| ------------ | ------ | ------- | ----------- |
| `sm`         | 24px   | 8px     | `text-xs`   |
| `md` default | 30px   | 12px    | `text-sm`   |
| `lg`         | 40px   | 16px    | `text-base` |

The steps target dense application UI, and a native browser input is about 30px too, so xUI controls
sit level with unstyled elements instead of towering over them. Re-tune the whole library's density
in one place:

```css
:root {
  --control-height-md: 2rem; /* a roomier default everywhere */
  --control-padding-md: 0.875rem;
}
```

In library code, never hard-code `h-10`/`h-11` on something a user clicks or types into - use
`h-(--control-height-md)` and `px-(--control-padding-md)`, and let the size variant swap the step.

## Control radius

`rounded-lg` is a size, and panes, cards and overlay surfaces use it too, so re-pointing it rounds
them along with the controls. `--radius-control` is the role instead: everything a user types in or
clicks carries it, nothing else does, and a theme that wants tighter controls inside softer panes
overrides just this one value.

```css
:root {
  --radius-control: 0.375rem; /* 6px controls, panes left alone */
}
```

In library code a control's own box uses `rounded-control`; its inner parts (a chip, a menu row, a
swatch) and every container keep the `rounded-*` scale.

## Chrome

`--hairline` and `--hairline-strong` are the seams between pieces of chrome - a line under a header,
a divider inside a joined control - and sit darker than `--border`, which is a component's own edge.
`--highlight` is the bevel along the top of a raised surface. All three are exposed as colours
(`border-hairline`, `bg-highlight`) and invert sensibly between the themes, so a graded bar is the
same two declarations in light and dark.

## Dark mode

Add `.dark` or `[data-theme='dark']`; with neither present the theme follows
`prefers-color-scheme`. Both selectors match on _any_ element, not just `<html>`, so a subtree can
render in the opposite theme:

```html
<html class="dark">
  …
  <aside class="light">Always-light sidebar</aside>
</html>
```

This is why the derived ramps are declared for every theme scope: a custom property that references
`var(--background)` is substituted where it is _declared_, so declaring them only on `:root` would
freeze a nested subtree at the document theme. Keep that in mind when adding tokens.

Do not write `dark:` variants in component code - the tokens already carry both themes. A `dark:`
class in a component is a sign a raw palette colour crept in.

## The bezelled skin

`@xui/core/styles/bezel.css` is an optional second skin: a Logic Pro / current-macOS reading of the
library for desktop-shaped applications - graphite panes in a near-black window, chrome with soft
gradients and hairline seams, bezelled controls, a glossy LCD, sunken wells.

```css
@import 'tailwindcss';
@import '@xui/core/styles/theme.css';
@import '@xui/core/styles/bezel.css';
```

```html
<html class="dark" data-skin="bezel"></html>
```

It is opt-in through `data-skin="bezel"` and scopes like the themes do, so a subtree can carry it
on its own. It re-tunes the base tokens, adds the materials below as `@utility` classes, and gives
the xUI controls their face by selecting on the `data-variant` / `data-color` each one reflects -
never on the utility classes a variant map emits.

| Utility                     | What it draws                                                          |
| --------------------------- | ---------------------------------------------------------------------- |
| `chrome-bar`                | A window bar: vertical gradient, top highlight, hairline under.        |
| `glass-bar`                 | A translucent toolbar over content, blurred like a macOS one.          |
| `pane` / `pane-header`      | A graphite pane with a hairline edge, and its graded title bar.        |
| `bezel` / `bezel-group`     | A raised face, and several joined into one capsule split by hairlines. |
| `lcd-glass`                 | A readout's glass: gradient, glare over the top half, inset edge.      |
| `well`                      | A recess cut into the surface.                                         |
| `section-label` / `readout` | A group heading, and tabular figures that do not jitter.               |

Use `bezel` and `bezel-group` for chrome controls built on native elements; xUI's own controls
already pick the face up. The skin carries nothing domain-shaped - meters, faders and track
palettes belong to the application that has tracks.

The **Foundations → Bezelled skin** story renders every material in both themes.

## Re-theming an application

Redeclare tokens after the import:

```css
@import 'tailwindcss';
@import '@xui/core/styles/theme.css';

:root {
  --primary: var(--color-violet-600);
  --surface-inset: var(--color-zinc-50);
  --radius-control: 0.375rem;
}
```

One intent declaration re-derives that intent's whole ramp, which is what makes re-theming a
two-line job. Scope the same declarations to a class or `[data-theme]` for per-area themes.

The rendered reference for every token, in both themes, is the **Design Tokens** page in Storybook
(`apps/ui-storybook/stories/design-tokens.stories.ts`).
