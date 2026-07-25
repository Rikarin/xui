# Styling rules

## Semantic tokens only

Every colour comes from the token layer. A raw Tailwind palette class cannot follow the active
theme, so it is a bug in both library and application code.

```html
<!-- correct -->
<div class="bg-surface text-foreground border-border rounded-lg border p-4">…</div>
<p class="text-foreground-muted text-sm">Updated 2 hours ago</p>
<span class="bg-error-subtle text-error-emphasis border-error-muted border">Failed</span>

<!-- wrong -->
<div class="border-gray-200 bg-white text-zinc-900 dark:bg-zinc-900">…</div>
```

Do not write `dark:` variants: the tokens already carry both themes, so a `dark:` class is a sign a
raw colour crept in. Pick the ramp step by role - see `../theming.md`.

## Variant inputs before classes

Check the component's variant axes (`xui_components_get`) before styling anything. If an axis
exists, use it:

```html
<button xuiButton color="error" variant="outline" size="sm">Delete</button>
<xui-callout color="warning" minimal compact>Disk almost full</xui-callout>
```

Reach for a `class` only for layout - width, placement, spacing between siblings.

## The `class` input merges

Every component accepts `class` and merges it with its own classes through `xui()`
(clsx + tailwind-merge), so a conflicting utility wins instead of duplicating:

```html
<xui-select class="w-64" />
<div xuiCard class="max-w-sm">…</div>
```

In library code the same contract is mandatory: build the host class with `xui(variants(…),
this.class())` and never drop the input.

```ts
protected readonly computedClass = computed(() =>
  xui(calloutVariants({ color: this.color(), compact: this.compact() }), this.class())
);
```

## Layout conventions

- `gap-*` on a flex/grid parent, not `space-*` on children.
- `size-*` when width and height match (`size-4`), not `h-4 w-4`.
- `shadow-elevation-{0..4}` and `shadow-elevation-overlay` for depth - that namespace is separate
  from Tailwind's `shadow-*` scale on purpose, so re-tuning elevation never changes `shadow-md`.
- `duration-fast|base|slow` for transitions rather than hand-picked milliseconds.

## Overlays

Never set `z-index` by hand on a popover, tooltip, menu, dialog, drawer or toast: they render
through the CDK overlay container, which owns stacking. If an overlay appears inline in the page,
the application is missing `@import '@angular/cdk/overlay-prebuilt.css';` - fix the import, not the
z-index.

## Focus and state

`--focus`, `--selection`, `--hover-overlay` and `--active-overlay` exist so interactive states look
the same everywhere. Use `focus-visible:` (not `focus:`) so keyboard focus is visible without
ringing every mouse click.
