import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiCalloutImports } from '@xui/callout';
import { XuiLinkImports } from '@xui/link';
import { XuiTextImports } from '@xui/text';
import { CodeBlock } from '../shared/code-block';
import { TableOfContents, type TocEntry } from '../shared/table-of-contents';

const TOC: TocEntry[] = [
  { id: 'requirements', label: 'Requirements', level: 2 },
  { id: 'install', label: 'Install', level: 2 },
  { id: 'manual', label: 'Wiring it by hand', level: 2 },
  { id: 'first-component', label: 'Your first component', level: 2 },
  { id: 'imports-barrel', label: 'The imports barrel', level: 2 },
  { id: 'class-input', label: 'The class input', level: 2 },
  { id: 'overlays', label: 'Overlays', level: 2 },
  { id: 'rtl', label: 'Right-to-left', level: 2 },
  { id: 'troubleshooting', label: 'Troubleshooting', level: 2 }
];

@Component({
  selector: 'docs-getting-started',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiCalloutImports, XuiLinkImports, XuiTextImports, CodeBlock, TableOfContents],
  template: `
    <div class="flex gap-8">
      <article class="max-w-3xl min-w-0 flex-1">
        <h1 xuiHeading [level]="1">Getting started</h1>
        <p xuiText color="muted" size="lg" class="mt-3">
          Install the core package, point Tailwind at the component sources, and add the components you need. Five
          minutes, and one thing that catches almost everyone — the <code xuiCode>&#64;source</code> glob.
        </p>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3 scroll-mt-20" id="requirements">Requirements</h2>
        <ul xuiList class="text-foreground-muted space-y-1">
          <li>Angular 22</li>
          <li>Tailwind CSS 4</li>
          <li>
            <code xuiCode>&#64;angular/cdk</code> 22 — a peer dependency of most packages, installed for you by
            <code xuiCode>ng add</code>
          </li>
        </ul>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3 scroll-mt-20" id="install">Install</h2>
        <p xuiText color="muted" class="mb-3">
          The schematic installs <code xuiCode>&#64;xui/core</code> and patches your global stylesheet: the theme
          import, the CDK overlay stylesheet, and a <code xuiCode>&#64;source</code> glob that lets Tailwind see the
          classes inside the published packages. It is idempotent — run it twice and it only adds what is missing.
        </p>
        <docs-code [code]="ngAdd" lang="bash" />

        <p xuiText color="muted" class="mt-4 mb-3">Then add the components you need:</p>
        <docs-code [code]="addPackages" lang="bash" />

        <xui-callout color="info" title="Nx workspace?" class="mt-5">
          Use <code xuiCode>nx add &#64;xui/core</code> instead — it resolves the schematic through the Nx executor.
          Pass <code xuiCode>--skip-overlay</code> if you will not use dialogs, drawers, popovers, tooltips, menus or
          toasts.
        </xui-callout>

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="manual">Wiring it by hand</h2>
        <p xuiText color="muted" class="mb-3">
          If you would rather not run the schematic, this is everything it writes into your global stylesheet:
        </p>
        <docs-code [code]="manualCss" lang="css" />

        <p xuiText color="muted" class="mt-4">
          The <code xuiCode>&#64;source</code> line is the one that matters. Tailwind 4 only emits a utility it has seen
          in a scanned file, and it does not scan <code xuiCode>node_modules</code> by default — without it every
          component renders unstyled. The path is relative to the stylesheet, so adjust the
          <code xuiCode>../</code> segments to match where yours lives.
        </p>

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="first-component">Your first component</h2>
        <docs-code [code]="firstComponent" lang="ts" />

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="imports-barrel">The imports barrel</h2>
        <p xuiText color="muted" class="mb-3">
          Every package exports a <code xuiCode>Xui&lt;Name&gt;Imports</code> const holding each declarable it ships —
          the component, its directives, its content projections. Import the barrel rather than the individual classes
          and a template cannot fail for a missing directive you did not know about.
        </p>
        <docs-code [code]="barrel" lang="ts" />

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="class-input">The class input</h2>
        <p xuiText color="muted" class="mb-3">
          Every component takes a <code xuiCode>class</code> input and merges it with its own classes through
          <code xuiCode>tailwind-merge</code>. A conflicting utility replaces the component's instead of fighting it, so
          there is no specificity war and no <code xuiCode>!important</code>.
        </p>
        <docs-code [code]="classInput" lang="html" />
        <p xuiText color="muted" size="sm" class="mt-3">
          Reach for <code xuiCode>class</code> for layout — width, placement, spacing between siblings. For anything
          visual, check whether the component has a variant input first; it almost always does.
        </p>

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="overlays">Overlays</h2>
        <p xuiText color="muted" class="mb-3">
          Popovers, tooltips, menus, dialogs, drawers and toasts render through the CDK overlay container, which owns
          stacking. Never set <code xuiCode>z-index</code> on one by hand. If an overlay appears inline in the page
          instead of floating, the overlay stylesheet import is missing.
        </p>
        <docs-code [code]="overlayCss" lang="css" />

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="rtl">Right-to-left</h2>
        <p xuiText color="muted" class="mb-3">
          Components read direction through <code xuiCode>&#64;angular/cdk/bidi</code>, which walks up to the nearest
          <code xuiCode>dir</code> attribute. Set it on <code xuiCode>&lt;html&gt;</code> and the whole library flips —
          component templates use logical properties (<code xuiCode>ms-</code>, <code xuiCode>pe-</code>,
          <code xuiCode>start-</code>) rather than left and right, so your own markup needs no changes either.
        </p>
        <docs-code [code]="rtl" lang="html" />

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="troubleshooting">Troubleshooting</h2>

        <p xuiText weight="medium" class="mt-6 mb-1">Everything renders unstyled</p>
        <p xuiText color="muted" size="sm">
          Tailwind is not scanning the packages. Check the <code xuiCode>&#64;source</code> path resolves from your
          stylesheet to <code xuiCode>node_modules/&#64;xui</code>.
        </p>

        <p xuiText weight="medium" class="mt-4 mb-1">An overlay renders in the page flow</p>
        <p xuiText color="muted" size="sm">
          The CDK overlay stylesheet is missing. Add the
          <code xuiCode>&#64;angular/cdk/overlay-prebuilt.css</code> import.
        </p>

        <p xuiText weight="medium" class="mt-4 mb-1">Colours look right in one theme and wrong in the other</p>
        <p xuiText color="muted" size="sm">
          A raw palette class crept in — <code xuiCode>bg-white</code>, <code xuiCode>text-zinc-900</code>. Those cannot
          follow the active theme. See <a xuiLink routerLink="/docs/theming">Theming</a> for the semantic token that
          replaces it.
        </p>

        <p xuiText weight="medium" class="mt-4 mb-1">A directive in a template does nothing</p>
        <p xuiText color="muted" size="sm">
          A declarable is missing from <code xuiCode>imports</code>. Use the package's
          <code xuiCode>Xui&lt;Name&gt;Imports</code> barrel rather than naming classes individually.
        </p>
      </article>

      <docs-table-of-contents class="hidden xl:block" [entries]="toc" />
    </div>
  `
})
export class GettingStarted {
  protected readonly toc = TOC;

  protected readonly ngAdd = 'ng add @xui/core';
  protected readonly addPackages = 'pnpm add @xui/button @xui/dialog @xui/icon';

  protected readonly manualCss = `@import 'tailwindcss';

/* The design tokens every @xui/* package styles against. */
@import '@xui/core/styles/theme.css';

/* Only needed for an overlay surface — popover, tooltip, menu,
   dialog, drawer or toast. */
@import '@angular/cdk/overlay-prebuilt.css';

/* Tailwind only emits utilities it can see, and it does not scan
   node_modules by default. */
@source '../node_modules/@xui';`;

  protected readonly firstComponent = `import { Component } from '@angular/core';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';

@Component({
  selector: 'app-example',
  imports: [XuiButtonImports, XuiCalloutImports],
  template: \`
    <xui-callout color="warning" title="Unsaved changes">
      Leaving now discards your edits.
    </xui-callout>

    <div class="mt-4 flex gap-2">
      <button xuiButton color="primary">Save</button>
      <button xuiButton variant="outline">Discard</button>
    </div>
  \`
})
export class Example {}`;

  protected readonly barrel = `import { XuiSelectImports } from '@xui/select';

@Component({
  imports: [XuiSelectImports],
  // <xui-select>, <xui-option>, <xui-option-group> — all of them
})`;

  protected readonly classInput = `<!-- layout is yours -->
<xui-select class="w-64" />
<div xuiCard class="max-w-sm">…</div>

<!-- appearance is the component's -->
<button xuiButton color="error" variant="outline" size="sm">Delete</button>`;

  protected readonly overlayCss = `@import '@angular/cdk/overlay-prebuilt.css';`;

  protected readonly rtl = `<html dir="rtl">`;
}
