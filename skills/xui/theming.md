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

## Which step to use

- `--<intent>` + `--<intent>-foreground` - a filled control (`bg-primary text-primary-foreground`).
- `--<intent>-darker` / `-lighter` - hover and border states of that filled control.
- `--<intent>-subtle` - a tinted background: callouts, tags, selected rows.
- `--<intent>-muted` - the border that pairs with a `subtle` background.
- `--<intent>-emphasis` - text or an icon that stays legible on `subtle`.

`subtle`, `muted`, `emphasis`, `darker` and `lighter` are **derived** from the intent base and
`--background` with `oklch()` and `color-mix()`. Overriding one intent re-colours its whole ramp.

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

## Re-theming an application

Redeclare tokens after the import:

```css
@import 'tailwindcss';
@import '@xui/core/styles/theme.css';

:root {
  --primary: var(--color-violet-600);
  --surface-inset: var(--color-zinc-50);
  --radius: 0.5rem;
}
```

One intent declaration re-derives that intent's whole ramp, which is what makes re-theming a
two-line job. Scope the same declarations to a class or `[data-theme]` for per-area themes.

The rendered reference for every token, in both themes, is the **Design Tokens** page in Storybook
(`apps/ui-storybook/stories/design-tokens.stories.ts`).
