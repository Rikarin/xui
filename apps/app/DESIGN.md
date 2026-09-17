---
name: xuijs.org
description: Black stage for a component library that performs live; the docs keep the library's own light/dark theme.
colors:
  stage-black: '#000000'
  surface: 'oklch(17% 0.004 286)'
  surface-raised: 'oklch(20% 0.004 286)'
  surface-inset: 'oklch(23% 0.004 286)'
  surface-overlay: 'oklch(24% 0.004 286)'
  glass-fill: 'color-mix(in oklab, #ffffff 5%, transparent)'
  glass-fill-hover: 'color-mix(in oklab, #ffffff 7%, transparent)'
  hairline-muted: 'color-mix(in oklab, #ffffff 7%, transparent)'
  hairline: 'color-mix(in oklab, #ffffff 12%, transparent)'
  hairline-card: 'color-mix(in oklab, #ffffff 10%, transparent)'
  hairline-hover: 'color-mix(in oklab, #ffffff 18%, transparent)'
  hairline-strong: 'color-mix(in oklab, #ffffff 22%, transparent)'
  foreground: 'oklch(98.5% 0 0)'
  foreground-muted: 'oklch(70.5% 0.015 286)'
  foreground-subtle: 'oklch(66% 0.01 286)'
  primary: 'oklch(55.88% 0.154 252.84)'
  focus: 'oklch(68.5% 0.169 237.3)'
  gradient-lavender: '#cabfff'
  gradient-ice: '#bfeaff'
  gradient-rose: '#ffabab'
  gradient-violet: '#bbadff'
  comet-lavender: 'rgb(170 153 255)'
  comet-cyan: 'rgb(26 179 255)'
typography:
  display:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '2.75rem'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.4
  lead:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.25
  code:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
rounded:
  control: '0.375rem'
  panel: '0.75rem'
  card: '1.5rem'
  pill: '9999px'
spacing:
  xs: '0.5rem'
  sm: '0.75rem'
  md: '1rem'
  lg: '1.25rem'
  xl: '1.5rem'
  2xl: '2rem'
  section-gap: '3rem'
  section-top: '6rem'
  section-top-wide: '8rem'
components:
  button-comet:
    backgroundColor: 'linear-gradient(90deg, rgb(170 153 255 / 0.24), rgb(26 179 255 / 0.24))'
    textColor: '{colors.foreground}'
    typography: '{typography.lead}'
    rounded: '{rounded.panel}'
    height: '3.5rem'
    padding: '0 1.625rem'
  button-comet-hover:
    backgroundColor: 'linear-gradient(90deg, rgb(170 153 255 / 0.34), rgb(26 179 255 / 0.34))'
  button-solid:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.foreground}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    height: '2.25rem'
    padding: '0 1.125rem'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.foreground-muted}'
    rounded: '{rounded.panel}'
    height: '3.5rem'
    padding: '0 1.25rem'
  button-ghost-hover:
    textColor: '{colors.foreground}'
  pill-version:
    backgroundColor: 'color-mix(in oklab, #ffffff 6%, transparent)'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '0.3rem 0.5rem 0.3rem 0.85rem'
  card-glass:
    backgroundColor: '{colors.glass-fill}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.card}'
    padding: '1.25rem'
  card-glass-hover:
    backgroundColor: '{colors.glass-fill-hover}'
  nav-segment:
    backgroundColor: '{colors.glass-fill}'
    textColor: '{colors.foreground-muted}'
    rounded: '{rounded.pill}'
    padding: '0.25rem'
---

# Design System: xuijs.org

## Overview

**Creative North Star: "The Dark Stage"**

The landing page is a black stage on which the xUI library performs. There is no scenery: the ground is true black, the only light comes from a cobalt wash behind the hero and from the components themselves, and every "product screenshot" is a running `@xui/*` component inside a translucent card. Display headlines are set in Inter at semibold with tight tracking and filled with a lavender-to-white-to-ice gradient, the single decorative flourish the world allows itself; everything below the headline is plain white-on-black prose. The manner is that of eagle.cool, which the product owner made binding: black ground, gradient display type, glass cards at a 24px radius, the product shown inside the cards.

Density is low and centred. Every section opens with a centred column no wider than 48rem (headline, one lead paragraph), then widens to a 100rem shell of cards laid on a 1rem gap. Cards are quiet glass, never grey slabs: a 5% white fill, a 10% white hairline, a 1px lit top edge. Depth is expressed through translucency and a single blue glow, not through drop shadows; the one object that casts light is the primary call to action, whose "comet" orbits its hairline.

This world is the site's marketing identity and is scoped to the `/` route via the `.landing.dark` host class. The documentation under `/docs` deliberately does not inherit it: it runs on the component library's own semantic token layer (`libs/core/styles/theme.css`, zinc light and zinc-950 dark) with a user toggle persisted in `localStorage['xui-docs-theme']`. The landing page overrides only the ground, the surface family, the border family and `--foreground-subtle`; every other token (primary, focus, text, control heights) is the library's own, so the library components render on the black stage without a fork.

**Key Characteristics:**

- True black ground (`--background: var(--color-black)`) pinned regardless of the site toggle
- Translucent glass cards: 5% white fill, 10% white hairline, 1.5rem radius, inset 1px top highlight
- Inter Variable as the one face, with `cv11` and `ss01` stylistic sets on
- Gradient text on display headlines (h1 and section h2), plus the softened cool fill on the two agent-tooling card titles; never on body or UI text
- One chromatic accent (the library's blue primary) confined to the header CTA, the hero glow and tiny status marks
- Depth by translucency and glow; no drop shadows except the CTA's own tinted lift
- Motion only where `prefers-reduced-motion: no-preference`: one staggered hero entrance, one orbiting comet

## Colors

Achromatic glass on black, lit by one blue; colour appears as light (glows, gradients, tints), not as fill.

### Primary

- **xUI Blue** (`{colors.primary}`, `--primary`): The library's intent colour, inherited unchanged from `theme.css`. On the landing page it fills exactly one control (the header's solid _Get started_), tints the hero glow at 55%, colours the "x" of the wordmark, and marks tiny status glyphs (`text-primary` icons, `bg-primary/15` check circles). It is not used on body text, card borders or section headlines.
- **Focus Sky** (`{colors.focus}`, `--focus`): 2px outline, 2px offset, on every keyboard-focused landing control. Inherited from the library.

### Secondary (gradient and comet family)

- **Lavender** (`{colors.gradient-lavender}`) and **Ice** (`{colors.gradient-ice}`): The two ends of `.landing-gradient`, the default display fill (`90deg, lavender 0% → white 45–55% → ice 100%`). Used on the h1 and on four of five section h2s.
- **Rose** (`{colors.gradient-rose}`) and **Violet** (`{colors.gradient-violet}`): The ends of `.landing-gradient-warm` (`90deg, rose 0% → white 40–52% → violet 100%`), the alternate fill. Shipped once, on the theming section's headline, to break the run of cool headlines. Use it sparingly and only on a display headline.
- **Comet Lavender** (`{colors.comet-lavender}`) and **Comet Cyan** (`{colors.comet-cyan}`): The tint pair of the primary CTA. At 24% alpha they fill the button, at 85% they draw its 1px hairline, and they reappear at 28% and 16% as the two smaller radial lobes of `.landing-glow`. They belong to the CTA and the glow; they are not a general accent.

### Neutral

- **Stage Black** (`{colors.stage-black}`): The page ground, `--background` and `--surface-sunken`. Also the header at 60% (`bg-black/60` + `backdrop-blur-md`) and the code panels inside cards at 40% (`bg-black/40`).
- **Surface family** (`{colors.surface}`, `{colors.surface-raised}`, `{colors.surface-inset}`, `{colors.surface-overlay}`): Near-black zinc-hued opaque surfaces (17%, 20%, 23%, 24% lightness) that the library's own components use for inputs, popovers and menus when they render on the stage. These are for `@xui/*` components; page-level containers use glass, not these.
- **Glass Fill** (`{colors.glass-fill}` → `{colors.glass-fill-hover}`): 5% white at rest, 7% on hover, on every `.landing-card`. The version pill and header nav segment sit at 6% and 5%.
- **Hairlines** (`{colors.hairline-muted}` 7%, `{colors.hairline-card}` 10%, `{colors.hairline}` 12%, `{colors.hairline-hover}` 18%, `{colors.hairline-strong}` 22%): The full border vocabulary is white at graduated alpha. 7% (`--border-muted`) divides regions inside a card; 10% outlines a card; 12% (`--border`) outlines pills and library controls; 18% is the card hover; 22% (`--border-strong`) is the library's strong border; 25% is the pill hover.
- **Foreground** (`{colors.foreground}`, zinc-100): Headings (via the gradient's white centre), card titles, primary button labels.
- **Foreground Muted** (`{colors.foreground-muted}`, zinc-400): Lead paragraphs, card body copy, ghost button labels, nav items at rest.
- **Foreground Subtle** (`{colors.foreground-subtle}`): Small print, counts, the "Built on" list. Raised from the library's zinc-500 to `oklch(66% 0.01 286)` because zinc-500 sits at 4.3:1 on true black; this clears 4.5:1.

### Named Rules

**The One Lamp Rule.** Blue owns exactly one region of the page at a time: the hero glow, the theming stage glow, the closer's glow. Elsewhere it is a 1rem glyph or the header button. A second blue-filled control on the same screen breaks the world.

**The White-Alpha Rule.** Every border and fill on the stage is white at an alpha between 5% and 25%. No grey hex, no zinc utility class, no opaque card. If a divider needs to be stronger, raise the alpha; do not change the hue.

**The Gradient-Is-Display Rule.** `.landing-gradient` and `.landing-gradient-warm` attach only to elements that also carry `.landing-display` (the h1 and section h2s). The one title-scale exception is `.landing-gradient-cool` (`90deg, color-mix(#aa99ff 80%, white) 25% → color-mix(#1ab3ff 80%, white) 100%`, the comet tint pair softened towards white), which the product owner asked for on the two agent-tooling card titles ("MCP server", "Agent skill") and nowhere else. Every other card title, pill, button, body and code line is solid `--foreground`.

## Typography

**Display Font:** Inter Variable (with `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Inter Variable (same face)
**Code Font:** the library's `font-mono` stack (`ui-monospace, SFMono-Regular, Menlo`)

**Character:** One face at two weights. Inter is set on `.landing.dark` with `font-feature-settings: 'cv11', 'ss01'` (single-storey a, open digits), which is what keeps it from reading as the system default. Display type is semibold, tight and balanced; everything else is regular weight and generous in leading. The pinned reference earned this: Inter is the display face of eagle.cool, and the gradient fill carries the display role that a second typeface would otherwise carry.

### Hierarchy

- **Display** (600, `2.75rem` → `3.75rem` at `sm` → `4.5rem` at `md`, 1.05, −0.025em, `text-wrap: balance`): The h1 only. Gradient-filled, centred, `width: fit-content` so the coloured ends land on the first and last word.
- **Headline** (600, `2.25rem` → `3rem` at `sm` → `3.75rem` at `md`, 1.05, −0.025em): Section h2s. Same class pair as the h1 (`.landing-display .landing-gradient`), one step down the ramp. The catalogue h2 is the one left-aligned instance (`.text-start`, capped at `3rem`).
- **Title** (600, `1.25rem`): Card titles inside pillar and agent cards; `1.125rem` inside the theming stage; `1rem` on catalogue tiles. Solid foreground, except the two agent card titles, which carry `.landing-gradient-cool`.
- **Lead** (400, `1.125rem` → `1.25rem` at `sm` in the hero only, muted): The one paragraph under each headline, `max-w-2xl` or `max-w-3xl`, centred.
- **Body** (400, `0.875rem`, `leading-relaxed`, muted): Card copy, footer links, table cells.
- **Label** (500, `0.8125rem`): The version pill. The "Built on" list is `0.875rem` at 500 in subtle.
- **Small print** (400, `0.875rem`, subtle): Requirements line under the hero CTA, group counts (`tabular-nums`), footer legal.
- **Code** (mono, `0.875rem`): Install and usage panels on `bg-black/40`, inline `<code xuiCode>` and `<kbd xuiKbd>` from the library.

### Named Rules

**The Two-Weight Rule.** Landing type is 600 (display, headline, title, button labels) or 400 (everything else), with 500 reserved for the pill and the "Built on" list. No 700, no 300.

**The Balanced Headline Rule.** Every display and headline element balances its lines (`text-wrap: balance`) and never runs past `max-w-3xl`. If a headline needs three lines at `md`, shorten the copy.

**The No-Eyebrow Rule.** Sections open with the gradient headline itself. There are no uppercase tracked kickers, numbered labels or icon eyebrows above headlines; the build shipped none and the world does not want them.

## Layout

The page is a single centred column of sections inside a `max-w-[100rem]` shell with `px-4` gutters (`sm:px-6`). Each section is two zones: a centred intro (`mx-auto max-w-3xl text-center`) holding headline and lead, then a grid of glass cards `mt-10` or `mt-12` below it. The hero intro is `max-w-4xl`; the "Built on" strip is `max-w-5xl`.

**Vertical rhythm.** Sections stack with top padding only: `pt-24` (6rem) rising to `sm:pt-32` (8rem); the hero is `pt-20 sm:pt-28`; the closer adds matching bottom padding. Inside an intro: headline → lead is `mt-5` (`mt-6` in the hero), lead → actions is `mt-9`, actions → small print is `mt-7`. Inside a card: title → copy is `mt-2`, body → footer row is `pt-4` to `pt-6` on `mt-auto`.

**Grids.** Card grids use `gap-4` (1rem) and step `sm:grid-cols-2` → `lg:grid-cols-3` → `xl:grid-cols-4` (catalogue) or `sm:grid-cols-2` → `xl:grid-cols-4` (pillars). Two-up feature cards are `lg:grid-cols-2`; the theming stage splits `lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`.

**The showcase strip.** Directly under the hero, `.landing-strip` is a real horizontal scroll container (`overflow-x: auto`, `scroll-snap-type: x mandatory`, `gap: 1rem`, `justify-content: safe center`) whose fixed-width cards (19rem to 22rem) bleed off both edges under a 4%/96% linear mask. It is keyboard-reachable and not a carousel: no auto-advance, no JS positioning.

**Header and footer (landing variant).** The header is `h-14`, sticky, `bg-black/60 backdrop-blur-md` with a 6% white bottom hairline; on `md` and up a centred pill nav segment floats at `start-1/2`; below `md` the nav becomes a horizontally scrolling chip row under the bar. The footer is a three-column sitemap (`md:grid-cols-[1.4fr_1fr_1fr]`, `gap-10`, `py-14`) under a 6% white top hairline.

**Responsive.** Breakpoints are Tailwind's: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. At 390px the hero stacks the CTA pair vertically (`flex-col` → `sm:flex-row`), the h1 drops to `2.75rem`, and all grids collapse to one column; nothing is hidden except the header version tag (`hidden sm:inline-flex`) and the desktop nav segment.

**The Intro-Then-Grid Rule.** A landing section is a centred headline and one lead paragraph, then cards. Do not put body copy beside a grid or open a section with a card.

## Elevation & Depth

Depth on the stage is tonal and luminous, not cast. Nothing on the page has a drop shadow except the primary CTA, whose shadow is a tinted lift in its own hue, not a grey. Three devices do the work:

1. **Translucency.** Cards are 5% white over black with a 10% hairline; a card in front of a glow lets the glow through. The header is 60% black with backdrop blur so content scrolls visibly beneath it.
2. **The lit edge.** Every `.landing-card` carries `inset 0 1px 0 rgb(255 255 255 / 6%)`; the CTA carries the same at 14% (18% on hover); the solid header button gets it via a `linear-gradient(oklch(from var(--primary) calc(l + 0.12) c h), transparent)` overlay. The top edge catching light is what separates glass from a grey rectangle.
3. **Glow bands.** `.landing-glow` is three radial gradients (primary at 55% from the top centre, comet lavender at 28% right, comet cyan at 16% left) applied to an absolutely-positioned `h-[40rem]` layer behind the hero and inside the closer card. `.landing-grid` is a 22px dot grid at 9% white, radially masked, used behind the agent section.

### Shadow Vocabulary

- **Card lit edge** (`inset 0 1px 0 color-mix(in oklab, var(--color-white) 6%, transparent)`): Every glass card, at rest and on hover.
- **Comet lift** (`inset 0 1px 0 rgb(255 255 255 / 0.14), 0 16px 40px -16px rgb(120 140 255 / 0.55)`): The primary CTA at rest; hover goes to `0.18` and `0 20px 48px -16px rgb(120 140 255 / 0.7)`. The only outer shadow on the page.

### Named Rules

**The No-Cast-Shadow Rule.** No grey or black `box-shadow` on any landing surface. Depth comes from alpha, blur and glow; if a card needs to separate from its neighbour, raise its hairline alpha.

**The Lit-Edge Rule.** Anything that reads as a raised object (card, CTA, solid button) carries a 1px white inset highlight on its top edge.

## Shapes

Three radii, each bound to a role. Cards are `1.5rem` (`.landing-card`, and the closer). Actions and panels are `0.75rem`: the comet CTA, the ghost button beside it (`rounded-xl`), and code panels. Compact controls are `0.375rem` (`.landing-buy`, the library's own `rounded-md` controls). Anything that wraps a short run of text is a full pill (`9999px`): the version pill, the header nav segment and its items, the mobile nav chips, the group-count check circles.

Borders are always 1px and always white-alpha (see The White-Alpha Rule). The CTA's hairline is a gradient drawn by masking a 1px padding box out of a border-box fill, so it can carry two colours where a `border` property cannot. Cards clip their contents (`overflow-hidden`) so code panels and previews inherit the 1.5rem corner. There are no angled cuts, no offset borders, no pill-shaped cards.

**The Three-Radius Rule.** 1.5rem for containers, 0.75rem for actions and panels, 0.375rem for compact controls, full pill for text tags. Do not introduce a fourth.

## Components

### Buttons

Confident but unlit at rest, with the comet as the single moving part.

- **Shape:** `0.75rem` on the hero pair; `0.375rem` on the header button.
- **Primary, comet (`.landing-cta`):** `h-14` (3.5rem), `padding-inline 1.625rem`, `1.125rem` at 600, white on a lavender→cyan 24% tint, gradient hairline at 85%, comet lift shadow. Contains the label and a 1.25rem arrow icon at `gap 0.5rem`. Shipped twice: hero and closer, same copy ("Get started").
- **Comet motion:** `::after` is a conic gradient rotated through `@property --landing-comet-angle`, animated `landing-comet 2.5s linear infinite` to `1.5turn`, at 55% opacity always (so touch screens see it) and 100% on hover and focus-visible. The animation runs only under `prefers-reduced-motion: no-preference`.
- **Hover / Active / Focus:** tint rises to 34%, shadow deepens; `translateY(1px)` on active; `outline: 2px solid var(--focus); outline-offset: 2px` on focus-visible.
- **Solid, header (`.landing-buy`):** `h-9` (2.25rem), `padding-inline 1.125rem`, `0.875rem` at 600, `--primary` fill with a lighter-primary-to-transparent top gradient and a 15% white inset outline. Hover is `opacity 0.92`. One per page, in the header.
- **Ghost, secondary (`xuiButton variant="ghost" size="lg" color="secondary"`):** the library's ghost button restyled to `h-14 rounded-xl px-5 text-base`, `text-foreground-muted` → `text-foreground` on hover. Always the second action beside the comet.

### Pill (`.landing-pill`)

- **Style:** inline-flex, `9999px`, 12% white hairline, 6% white fill, `0.3rem 0.5rem 0.3rem 0.85rem` padding (tighter on the trailing icon side), `0.8125rem` at 500, foreground text with a muted 1rem chevron.
- **State:** hairline to 25% on hover; focus ring as buttons. Shipped once as the version link above the h1; the header's nav segment uses the same recipe (`rounded-full border border-white/10 bg-white/5 p-1`) around ghost `rounded-full` items.

### Cards (`.landing-card`)

- **Corner Style:** `1.5rem`.
- **Background:** 5% white; 7% on `.landing-card-interactive:hover`.
- **Shadow Strategy:** inset lit edge only (see Elevation & Depth).
- **Border:** 1px at 10% white; 18% on interactive hover, with `translateY(-2px)` over 300ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Internal Padding:** `p-5` (1.25rem) for strip cards and catalogue tiles; `p-6` (1.5rem) for pillar text and agent cards, `sm:p-8`; the closer is `px-6 py-16 sm:px-12 sm:py-24`.
- **Composition:** showcase cards are fixed-width (`w-[19rem]` to `w-[22rem]`) flex columns with a `mt-auto` footer row of library controls; pillar cards stack a `bg-black/40` preview region (`min-h-[13.5rem] p-4`, 6% white bottom hairline) over a text block. Card titles are solid foreground at 600; body is `xuiText color="muted" size="sm"`.
- **Interactive variant:** only the catalogue tiles (links to `/docs/components#group`) carry `.landing-card-interactive`. Showcase and pillar cards do not lift, because their contents are the interactive thing.

### Code panels

- **Style:** a `.landing-card overflow-hidden` wrapper, a `px-5 py-3` title row with a 1rem icon and `text-xs`/`text-sm` label over a 6% white bottom hairline, then `docs-code` on `bg-black/40`. Shipped in the pillars, agent and install sections.

### Navigation (landing header)

- **Style:** `h-14` sticky bar, `bg-black/60 backdrop-blur-md`, 6% white bottom hairline; wordmark at `1.125rem` 600 with the "x" in `text-primary`; centred pill segment of ghost `rounded-full` links in `text-foreground-muted`, hover `text-foreground`; `.landing-buy` at the end.
- **Mobile:** the segment hides below `md` and a scrolling chip row (`gap-1 px-3 pb-2`, scrollbars hidden) takes its place under the bar.

### Showcase strip (`.landing-strip`)

The signature composition: a snap-scrolling row of live `@xui/*` components (button set, date picker, member table, segmented control and slider, OTP and rate) in glass cards, edge-masked to 4%/96%, `scroll-padding-inline 1.5rem`, `padding-block 0.5rem 1.25rem`, thin scrollbar. Each child is `scroll-snap-align: center; flex: 0 0 auto`.

### Hero entrance (`.landing-rise`)

One motion grammar for arrival: `opacity 0 → 1`, `translateY(14px) → 0`, `blur(6px) → 0` over 900ms `cubic-bezier(0.16, 1, 0.3, 1)`, staggered by `--i × 90ms` on the pill, h1, lead, actions, small print and strip (`--i` 0 to 5). Elements are visible by default; the animation exists only under `prefers-reduced-motion: no-preference`.

## Do's and Don'ts

### Do:

- **Do** pin the stage with `landing dark bg-background text-foreground` on the route host, not on `body`, so `/docs` keeps its own theme and toggle.
- **Do** build new landing surfaces from `.landing-card`, `.landing-display` + `.landing-gradient`, `.landing-cta`, `.landing-pill` and `.landing-glow`; extend these classes in `styles.css` rather than inventing parallel utilities.
- **Do** use the library's own tokens (`--primary`, `--focus`, `--foreground-*`, `--surface-*`) inside cards; the stage overrides only ground, surfaces, borders and `--foreground-subtle`.
- **Do** show a running `@xui/*` component where a product image would otherwise go; the strip and the theming stage are the pattern.
- **Do** keep `--foreground-subtle` at or above `oklch(66% 0.01 286)` on black; the library's zinc-500 fails 4.5:1 there.
- **Do** gate every animation (`landing-rise`, `landing-comet`) behind `prefers-reduced-motion: no-preference` and leave the element fully visible without it.
- **Do** put the second action beside the comet as a ghost `xuiButton` at the same `h-14 rounded-xl`; the pair is always one lit, one unlit.

### Don't:

- **Don't** apply `.landing-gradient` or `.landing-gradient-warm` to anything that is not a `.landing-display` headline.
- **Don't** fill a second control with `--primary` on the same screen as the header button; blue is the header CTA, the glow and 1rem glyphs.
- **Don't** use grey hex or zinc utility colours for landing borders or fills; use white at 5% to 25% alpha.
- **Don't** add grey or black drop shadows; the comet lift is the only outer shadow, and it is tinted.
- **Don't** put uppercase tracked kickers, eyebrows or numbered labels above section headlines.
- **Don't** introduce a second typeface or a weight outside 400/500/600; Inter Variable with `cv11`/`ss01` is the whole voice.
- **Don't** restyle `/docs` pages in the landing manner; they inherit `theme.css` light/dark and the user toggle by design.
- **Don't** hardcode component counts or group names; they come from `src/generated/manifest.ts`.
