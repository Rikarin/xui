# Composition rules

Confirm selectors with `xui_components_get` - the patterns below are the shapes, not a substitute
for the API.

## Items belong inside their container

A menu item, tab, accordion item, radio, table cell or select option only works inside its own
parent, which owns the keyboard model, roving focus and ARIA wiring:

```html
<xui-menu>…<button xuiMenuItem>Rename</button>…</xui-menu>
<xui-tabs><xui-tab id="overview" title="Overview">…</xui-tab></xui-tabs>
<xui-accordion><xui-accordion-item value="shipping" title="…">…</xui-accordion-item></xui-accordion>
<xui-radio-group [(value)]="plan"><xui-radio value="free" /></xui-radio-group>
<xui-table
  ><xui-tr><xui-th>Name</xui-th></xui-tr
  ><xui-tr><xui-td>John</xui-td></xui-tr></xui-table
>
```

Anything with an `id`/`value` identity (`xui-tab`, `xui-accordion-item`, `xui-radio`) needs it -
the parent tracks selection by that value.

## Anchored overlays: trigger directive + `ng-template`

Popovers, menus and context menus take their content as a template, so nothing renders until the
overlay opens:

```html
<button xuiButton [xuiPopover]="content">Open</button>
<ng-template #content>
  <div class="max-w-xs p-4">…</div>
</ng-template>

<button xuiButton [xuiMenuTriggerFor]="menu">File actions</button>
<ng-template #menu>
  <xui-menu>
    <button xuiMenuItem icon="matContentCopyRound">Duplicate<span menuItemLabel>⌘D</span></button>
    <xui-menu-divider />
    <button xuiMenuItem icon="matDeleteRound" intent="error">Delete</button>
  </xui-menu>
</ng-template>
```

`[xuiTooltip]` takes the text (or a template) directly: `<button xuiButton [xuiTooltip]="'Saves
without leaving the page'">`. Tooltips are hints - never put an action or essential-only
information in one.

## Modal surfaces: two-way open state

Dialog, drawer and alert-dialog are declared in the template and driven by a signal:

```html
<button xuiButton (click)="open.set(true)">Edit profile</button>

<xui-dialog [(isOpen)]="open" title="Edit profile" icon="matPersonRound">
  <xui-dialog-body>…</xui-dialog-body>
  <xui-dialog-footer>
    <button xuiButton variant="ghost" (click)="open.set(false)">Cancel</button>
    <button xuiButton (click)="save()">Save</button>
  </xui-dialog-footer>
</xui-dialog>
```

- A dialog or drawer always needs a `title` - it is the accessible name of the surface.
- Body content goes in `<xui-dialog-body>`; it is what scrolls when the content is tall.
- Actions go in `<xui-dialog-footer>`, primary action last.
- Use `<xui-alert-dialog destructive …>` for confirmations rather than building one out of a dialog:
  it already wires `title`, `description`, the confirm/cancel labels and the destructive styling.
- Toasts need `<xui-toast-container />` mounted once, near the application root.

## Named projection slots

Some components project into named slots, marked by a bare attribute on the child:

```html
<xui-non-ideal-state [title]="title" [description]="description">
  <ng-icon visual xui size="xl" name="matSearchOffRound" />
  <button action xuiButton size="sm" variant="outline">Clear filters</button>
</xui-non-ideal-state>
```

`xui_components_get` shows the selectors a package projects (`visual`, `action`, `menuItemLabel`,
…). Do not invent slot names.

## Use the component instead of hand-rolling it

| Instead of                              | Use                                            |
| --------------------------------------- | ---------------------------------------------- |
| A styled `<div>` banner                 | `xui-callout` (or `xui-alert` for dismissable) |
| "No results" markup                     | `xui-non-ideal-state`                          |
| A success/error page                    | `xui-result`                                   |
| A pulsing grey box                      | `xui-skeleton`                                 |
| A hand-built spinner                    | `xui-spinner`, or `[loading]` on the button    |
| A coloured pill                         | `xui-tag`, `xui-badge`, `xui-status`           |
| `<hr>` / a border-only divider          | `xui-divider`                                  |
| Manually styled headings and paragraphs | `xuiHeading`, `xuiText`, `xuiCode`, `xuiList`  |
| A `<button>` next to an `<input>`       | `[xuiControlGroup]` (joined controls)          |
| Ad-hoc key hints                        | `xui-kbd`                                      |

## Data-heavy surfaces

`@xui/table` is the presentational table (`xui-table`, `xui-tr`, `xui-th`, `xui-td`,
`xui-caption`). For sorting, virtualisation, editing and column management use `@xui/data-table`,
which builds on `@xui/core/grid` - do not grow the simple table into one by hand.
