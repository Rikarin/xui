# Icon rules

xUI renders icons with [`@ng-icons`](https://ng-icons.github.io). The library ships Material Icons
and Material Symbols; the icon names are the `@ng-icons` names (`matPersonRound`,
`matDeleteRound`, `matSearchOffRound`).

## Register every icon you name

`@ng-icons` resolves icons from what the injector knows, so an unregistered name renders nothing:

```ts
import { provideIcons } from '@ng-icons/core';
import { matDeleteRound, matPersonRound } from '@ng-icons/material-icons/round';

@Component({
  selector: 'app-profile',
  imports: [XuiButtonImports, XuiDialogImports, XuiIconImports],
  providers: [provideIcons({ matPersonRound, matDeleteRound })],
  template: `…`
})
export class Profile {}
```

This applies to icons named by _string inputs_ too - `icon="matPersonRound"` on `xui-dialog`,
`xuiMenuItem`, `xui-callout` and friends resolves through the same registry.

## Rendering an icon directly

`@xui/icon` is a directive on `<ng-icon>`, so the `xui` attribute is what applies sizing and
colour:

```html
<ng-icon xui name="matCheckRound" /> <ng-icon xui size="sm" color="error" name="matCloseRound" title="Remove" />
```

- `size`: `xs` (12px), `sm` (16px), `md` (24px), `lg` (32px), `xl` (48px), `none`, or any CSS
  length. Do not add `h-*`/`w-*` classes - use `size`.
- `color`: `inherit` (default), `muted`, `subtle`, or an intent (`primary`, `error`, …). Inside a
  button or tag the icon should inherit, not be coloured separately.
- An icon is decorative and hidden from assistive technology by default. Give it a `title` when it
  carries meaning on its own - an icon-only button, a status glyph - and it becomes an `img` with
  that accessible name.

## Icons inside components

Where a component takes an `icon` input, use it instead of projecting an `<ng-icon>` yourself: the
component then owns the placement, size and colour for that slot.

```html
<button xuiMenuItem icon="matContentCopyRound">Duplicate</button>
<xui-callout color="warning" title="Disk almost full">…</xui-callout>
```

A `<button xuiButton>` with only an icon still needs an accessible name - `aria-label` on the
button, or `title` on the icon.
