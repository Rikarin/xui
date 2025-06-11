<p style="font-size: 5rem; font-weight: 700; text-align: center">
  <span style="color: #1f75cb">x</span>UI
</p>

---

![Build Status](https://github.com/rikarin/xui/actions/workflows/continuous-delivery.yaml/badge.svg?branch=master)
[![Demo](https://img.shields.io/badge/demo-online-ed1c46)](https://xuijs.org/)
[![npm](https://img.shields.io/npm/v/%40xui/components.svg?maxAge=2592000?style=plastic)](https://www.npmjs.com/org/xui)
[![Downloads](https://img.shields.io/npm/dt/%40xui/components.svg)](https://www.npmjs.com/org/xui)
[![Monthly Downloads](https://img.shields.io/npm/dm/%40xui/components.svg)](https://www.npmjs.com/org/xui)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/%40xui/components)](https://bundlephobia.com/result?p=xui)
[![License](https://img.shields.io/npm/l/express.svg?maxAge=2592000)](/LICENSE)
[![Discord](https://img.shields.io/discord/776258487307075594.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/aPkZsFcu)
[![Netlify Status](https://api.netlify.com/api/v1/badges/fa0cfd14-97df-47fa-8a7c-152e6d4cfda2/deploy-status)](https://app.netlify.com/sites/xui/deploys)

xUI is a customizable Angular 19 UI Library with full support of TailwindCSS styling based on popular React library ShardCN and its Angular alternative SpartanUI.

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
- [Installation](#installation)

<a name="installation"></a>

## Installation

Install package with **PNPM**

```bash
pnpm i @xui/core ....
```

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

## Roadmap (12/42)

- [ ] Accordion
- [ ] Alert
- [ ] Alert Dialog
- [ ] Avatar
- [x] Badge
- [x] Breadcrumb
- [x] Button
- [x] Button Group
- [ ] Calendar
- [ ] Card
- [ ] Carousel
- [x] Checkbox
- [ ] Collapsible
- [ ] Combobox
- [ ] Command
- [ ] Date Picker
- [ ] Date Range Picker
- [ ] Dialog
- [x] Form Field
- [ ] Hover Card
- [x] Icon
- [x] Input
- [x] Label
- [ ] Menu
- [ ] Pagination
- [ ] Popover
- [ ] Progress
- [ ] Radio Group
- [ ] Scroll Area
- [ ] Select
- [ ] Separator
- [ ] Sheet
- [x] Skeleton
- [ ] Slider
- [x] Sonner
- [ ] Spinner
- [x] Status
- [ ] Switch
- [ ] Table
- [ ] Tabs
- [ ] Toggle
- [ ] Tooltip
- [ ] Typography

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


- ESLint configs
- commitlint
- move storybook with stories from libs to apps