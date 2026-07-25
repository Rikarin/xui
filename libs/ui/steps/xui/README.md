<p style="font-size: 5rem; font-weight: 700; text-align: center">
  <span style="color: #1f75cb">x</span>UI
</p>

---

![Build Status](https://github.com/rikarin/xui/actions/workflows/publish.yaml/badge.svg?branch=develop)
[![Demo](https://img.shields.io/badge/demo-online-ed1c46)](https://xuijs.org/)
[![npm](https://img.shields.io/npm/v/%40xui/core.svg?maxAge=2592000?style=plastic)](https://www.npmjs.com/org/xui)
[![License](https://img.shields.io/npm/l/express.svg?maxAge=2592000)](/LICENSE)
[![Netlify Status](https://api.netlify.com/api/v1/badges/fa0cfd14-97df-47fa-8a7c-152e6d4cfda2/deploy-status)](https://app.netlify.com/sites/xui/deploys)

xUI is a customizable Angular 22 UI Library with full support of TailwindCSS styling based on popular React library ShardCN and its Angular alternative SpartanUI.

## Features

- **35+ High-Quality Angular Components:** Ready to use out of the box.
- **Powerful Theme Customization:** Detailed customization options with default themes.
- **High Performance:** Supports Zoneless, OnPush mode, and Signals for optimized performance.
- **Accessibility:** Supports WCAG 2.0 standards.
- **Powerful Theme Customization:** Install each visual component and customize it according your needs
- **TypeScript:** Written with predictable static types.

## Table of Contents

- [Storybook](https://develop--67d2b4c756077a325913e5d9.chromatic.com/?globals=theme:dark)
- [StackBlitz Demo](https://stackblitz.com/fork/xui)
- [Documentation](https://xuijs.org)
- [Live Demo](https://cord.dj/r)
- [Packages](#packages)
- [Installation](#installation)
- [Browser Support](#browser-support)
- [Development](#development)
- [Issues](#issues)
- [Roadmap](#roadmap)

## Packages

| Package      | Usage                                                                                                                                                                                                                                                                                                                                                                                                                             | Description                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Core         | [![Downloads](https://img.shields.io/npm/dt/%40xui/core.svg)](https://www.npmjs.com/package/%40xui/core)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/core.svg)](https://www.npmjs.com/package/%40xui/core)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/core)](https://bundlephobia.com/result?p=%40xui/core)                                                 | Core package required by all other packages |
| Badge        | [![Downloads](https://img.shields.io/npm/dt/%40xui/badge.svg)](https://www.npmjs.com/package/%40xui/badge)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/badge.svg)](https://www.npmjs.com/package/%40xui/badge)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/badge)](https://bundlephobia.com/result?p=%40xui/badge)                                           | Badge component                             |
| Breadcrumb   | [![Downloads](https://img.shields.io/npm/dt/%40xui/breadcrumb.svg)](https://www.npmjs.com/package/%40xui/breadcrumb)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/breadcrumb.svg)](https://www.npmjs.com/package/%40xui/breadcrumb)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/breadcrumb)](https://bundlephobia.com/result?p=%40xui/breadcrumb)             | Breadcrumb component                        |
| Button       | [![Downloads](https://img.shields.io/npm/dt/%40xui/button.svg)](https://www.npmjs.com/package/%40xui/button)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/button.svg)](https://www.npmjs.com/package/%40xui/button)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/button)](https://bundlephobia.com/result?p=%40xui/button)                                     | Button component                            |
| Button Group | [![Downloads](https://img.shields.io/npm/dt/%40xui/button-group.svg)](https://www.npmjs.com/package/%40xui/button-group)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/button-group.svg)](https://www.npmjs.com/package/%40xui/button-group)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/button-group)](https://bundlephobia.com/result?p=%40xui/button-group) | Button Group component                      |
| Checkbox     | [![Downloads](https://img.shields.io/npm/dt/%40xui/checkbox.svg)](https://www.npmjs.com/package/%40xui/checkbox)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/checkbox.svg)](https://www.npmjs.com/package/%40xui/checkbox)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/checkbox)](https://bundlephobia.com/result?p=%40xui/checkbox)                         | Checkbox component                          |
| Form Field   | [![Downloads](https://img.shields.io/npm/dt/%40xui/form-field.svg)](https://www.npmjs.com/package/%40xui/form-field)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/form-field.svg)](https://www.npmjs.com/package/%40xui/form-field)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/form-field)](https://bundlephobia.com/result?p=%40xui/form-field)             | Form Field component                        |
| Icon         | [![Downloads](https://img.shields.io/npm/dt/%40xui/icon.svg)](https://www.npmjs.com/package/%40xui/icon)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/icon.svg)](https://www.npmjs.com/package/%40xui/icon)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/icon)](https://bundlephobia.com/result?p=%40xui/icon)                                                 | Icon component                              |
| Input        | [![Downloads](https://img.shields.io/npm/dt/%40xui/input.svg)](https://www.npmjs.com/package/%40xui/input)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/input.svg)](https://www.npmjs.com/package/%40xui/input)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/input)](https://bundlephobia.com/result?p=%40xui/input)                                           | Input component                             |
| Label        | [![Downloads](https://img.shields.io/npm/dt/%40xui/label.svg)](https://www.npmjs.com/package/%40xui/label)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/label.svg)](https://www.npmjs.com/package/%40xui/label)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/label)](https://bundlephobia.com/result?p=%40xui/label)                                           | Label component                             |
| Skeleton     | [![Downloads](https://img.shields.io/npm/dt/%40xui/skeleton.svg)](https://www.npmjs.com/package/%40xui/skeleton)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/skeleton.svg)](https://www.npmjs.com/package/%40xui/skeleton)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/skeleton)](https://bundlephobia.com/result?p=%40xui/skeleton)                         | Skeleton component                          |
| Sonner       | [![Downloads](https://img.shields.io/npm/dt/%40xui/sonner.svg)](https://www.npmjs.com/package/%40xui/sonner)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/sonner.svg)](https://www.npmjs.com/package/%40xui/sonner)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/sonner)](https://bundlephobia.com/result?p=%40xui/sonner)                                     | Sonner component                            |
| Spinner      | [![Downloads](https://img.shields.io/npm/dt/%40xui/spinner.svg)](https://www.npmjs.com/package/%40xui/spinner)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/spinner.svg)](https://www.npmjs.com/package/%40xui/spinner)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/spinner)](https://bundlephobia.com/result?p=%40xui/spinner)                               | Spinner component                           |
| Status       | [![Downloads](https://img.shields.io/npm/dt/%40xui/status.svg)](https://www.npmjs.com/package/%40xui/status)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/status.svg)](https://www.npmjs.com/package/%40xui/status)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/status)](https://bundlephobia.com/result?p=%40xui/status)                                     | Status component                            |
| Table        | [![Downloads](https://img.shields.io/npm/dt/%40xui/table.svg)](https://www.npmjs.com/package/%40xui/table)<br />[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/table.svg)](https://www.npmjs.com/package/%40xui/table)<br />[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/table)](https://bundlephobia.com/result?p=%40xui/table)                                           | Table component                             |

## Installation

Install package with **PNPM**

```bash
pnpm i @xui/core ....
```

## Theming

Every `@xui/*` component styles itself with semantic Tailwind utilities — `bg-surface`,
`text-foreground-muted`, `border-error-muted` — that resolve through the token layer shipped with
`@xui/core`. Import it once, after Tailwind:

```css
@import 'tailwindcss';
@import '@xui/core/styles/theme.css';

/* Only needed if you use an overlay surface — popover, tooltip, menu, dialog,
   drawer or toast. Without it overlays render in the document flow. */
@import '@angular/cdk/overlay-prebuilt.css';

/* Tell Tailwind to scan the component sources for utility classes. */
@source '../node_modules/@xui';
```

Switch themes by putting `.dark` (or `[data-theme='dark']`) on `<html>`; with neither class
present the theme follows `prefers-color-scheme`. Both selectors also work on any element, so a
subtree can render in the opposite theme.

Re-theme by overriding tokens after the import — the `darker` / `lighter` / `subtle` / `muted` /
`emphasis` steps of each intent are derived, so one declaration re-colours the whole ramp:

```css
:root {
  --primary: var(--color-violet-600);
  --surface-inset: var(--color-zinc-50);
}
```

The full token reference, rendered in both themes, is the **Design Tokens** page in
[Storybook](https://develop--67d2b4c756077a325913e5d9.chromatic.com/?globals=theme:dark).

## Browser Support

xUI Supports most recent browsers according to Angular [support](https://angular.io/guide/browser-support).

## Development

The project uses `NX` and `Angular` to build the package.

To start docs page use

```bash
pnpm start
```

To start storybook use

```bash
pnpm storybook
```

## Issues

If you find any issues in the library or have and idea for an improvement feel free to open an [issue](https://github.com/Rikarin/xui/issues).

## Roadmap

- [ ] Accordion
- [ ] Alert
- [ ] Alert Dialog
- [ ] Avatar
- [ ] Calendar
- [ ] Card
- [ ] Carousel
- [ ] Collapsible
- [ ] Combobox
- [ ] Command
- [ ] Date Picker
- [ ] Date Range Picker
- [ ] Dialog
- [ ] Hover Card
- [ ] Menu
- [ ] Pagination
- [ ] Popover
- [ ] Progress
- [ ] Radio Group
- [ ] Scroll Area
- [ ] Select
- [ ] Separator
- [ ] Sheet
- [ ] Slider
- [ ] Switch
- [ ] Tabs
- [ ] Toggle
- [ ] Tooltip
- [ ] Typography
- [ ] Input OTP
- [ ] Toggle Group

### Additional

- [ ] Decagram
- [ ] Settings
- [ ] Drawer
- [ ] Panel Bar
- [ ] Textarea
- [ ] Time Picker
- [ ] Image Upload
- [ ] Banner
- [ ] Snack bar

## Opinionated "components"

- [ ] Graph View (Nodes)
- [ ] Analysis
- [ ] Charts (NG Charts?)

## CLI

Make cli to install the components

## TODO

- Button

  - Icon
  - Shine

- Breadcrumb

  - fix styling issues
  - on hover stuff
  - data driven component

- Sonner

  - Colors

- adjust generator to generate stories into the apps/storybook
