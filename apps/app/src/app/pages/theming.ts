import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XuiCalloutImports } from '@xui/callout';
import { XuiTableImports } from '@xui/table';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { TOKENS } from '../../generated/manifest';
import type { DocsToken } from '../core/docs.model';
import { CodeBlock } from '../shared/code-block';
import { HeadingAnchor } from '../shared/heading-anchor';
import { TableOfContents, type TocEntry } from '../shared/table-of-contents';

const GROUP_LABEL: Record<string, string> = {
  surfaces: 'Surfaces',
  text: 'Text',
  borders: 'Borders',
  intents: 'Intents',
  state: 'State',
  elevation: 'Elevation',
  motion: 'Motion',
  typography: 'Typography',
  other: 'Other'
};

const GROUP_BLURB: Record<string, string> = {
  surfaces: 'Backgrounds, in depth order. `background` is the page, `surface` sits on it, `surface-raised` on that.',
  text: 'Foreground colours by emphasis, not by shade.',
  borders: 'Divider and outline colours.',
  intents: 'The six meanings. Each has a derived ramp, so re-colouring one declaration re-colours all of it.',
  state: 'Focus, selection and the hover/active overlays, so interactive states look the same everywhere.',
  elevation: 'The shadow scale. Separate from Tailwind’s `shadow-*` so re-tuning depth never moves `shadow-md`.',
  motion: 'Durations and easings.',
  typography: 'Font stacks.',
  other: 'Everything else the theme declares.'
};

/** Colour-valued groups get a swatch; a duration or a font stack does not. */
const SWATCH_GROUPS = new Set(['surfaces', 'text', 'borders', 'intents', 'state']);

@Component({
  selector: 'docs-theming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    XuiCalloutImports,
    XuiTableImports,
    XuiTagImports,
    XuiTextImports,
    CodeBlock,
    HeadingAnchor,
    TableOfContents
  ],
  template: `
    <div class="flex gap-8">
      <article class="max-w-3xl min-w-0 flex-1">
        <h1 xuiHeading [level]="1">Theming</h1>
        <p xuiText color="muted" size="lg" class="mt-3">
          Every colour in the library resolves through one token layer. That is what makes the toggle in the header work
          without a single <code xuiCode>dark:</code> class, and it is why re-theming is a handful of CSS declarations
          rather than a fork.
        </p>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3" docsAnchor="how">How it works</h2>
        <p xuiText color="muted" class="mb-3">
          Components style themselves with semantic utilities — <code xuiCode>bg-surface</code>,
          <code xuiCode>text-foreground-muted</code>, <code xuiCode>border-error-muted</code> — which Tailwind resolves
          to custom properties declared in <code xuiCode>&#64;xui/core/styles/theme.css</code>. Swap the values and
          every component follows.
        </p>

        <xui-callout color="warning" title="Never reach for the raw palette" class="mb-6">
          <code xuiCode>bg-white</code> and <code xuiCode>text-zinc-900</code> cannot follow the active theme. If you
          find yourself writing a <code xuiCode>dark:</code> variant, that is the signal a raw colour crept in — there
          is a token for it.
        </xui-callout>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3" docsAnchor="switching">Switching themes</h2>
        <p xuiText color="muted" class="mb-3">
          Put <code xuiCode>.dark</code> or <code xuiCode>[data-theme='dark']</code> on
          <code xuiCode>&lt;html&gt;</code>. With neither present the theme follows
          <code xuiCode>prefers-color-scheme</code>. Both selectors work on any element, so a subtree can render in the
          opposite theme — useful for a preview pane.
        </p>
        <docs-code [code]="switching" lang="html" />

        <p xuiText color="muted" class="mt-4 mb-3">
          To avoid a flash of the wrong theme, decide before first paint rather than at bootstrap. This site uses
          exactly this:
        </p>
        <docs-code [code]="noFlash" lang="ts" />

        <h2 xuiHeading [level]="2" class="mt-10 mb-3" docsAnchor="retheming">Re-theming</h2>
        <p xuiText color="muted" class="mb-3">
          Override tokens after the import. The <code xuiCode>darker</code>, <code xuiCode>lighter</code>,
          <code xuiCode>subtle</code>, <code xuiCode>muted</code> and <code xuiCode>emphasis</code> steps of each intent
          are derived with <code xuiCode>oklch()</code> and <code xuiCode>color-mix()</code>, so one declaration
          re-colours the whole ramp — hover, border, badge and callout included.
        </p>
        <docs-code [code]="retheme" lang="css" />

        <xui-callout color="primary" title="Do it with the swatches instead" class="mt-4">
          The <a class="text-link hover:text-link-hover underline" href="/docs/theme-builder">theme builder</a> edits
          these same tokens with a colour picker, re-themes this whole site as you go, checks the contrast of every pair
          that has to stay legible, and hands back exactly this block of CSS.
        </xui-callout>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3" docsAnchor="density">Control density</h2>
        <p xuiText color="muted" class="mb-3">
          Anything you click or type into takes its height and horizontal padding from one scale, so a button, an input
          and a date field on the same row line up. Override the middle step and the library re-tunes with it.
        </p>
        <docs-code [code]="density" lang="css" />

        <h2 xuiHeading [level]="2" class="mt-10 mb-4" docsAnchor="reference">Token reference</h2>
        <p xuiText color="muted" class="mb-6">
          {{ tokenCount }} tokens, read out of <code xuiCode>theme.css</code> at build time. Swatches render in
          whichever theme you are viewing.
        </p>

        @for (group of groups; track group.key) {
          <section class="mb-10">
            <h3 xuiHeading [level]="3" class="mb-1" [docsAnchor]="'tokens-' + group.key">
              {{ group.label }}
            </h3>
            <p xuiText color="muted" size="sm" class="mb-3">{{ group.blurb }}</p>

            <xui-table bordered compact class="w-full">
              <xui-tr>
                @if (group.swatch) {
                  <xui-th class="w-16 shrink-0">Colour</xui-th>
                }
                <xui-th class="min-w-0 flex-1">Token</xui-th>
                <xui-th class="w-28 min-w-0 shrink">Utility</xui-th>
              </xui-tr>
              @for (token of group.tokens; track token.name) {
                <xui-tr>
                  @if (group.swatch) {
                    <xui-td class="w-16 shrink-0">
                      <span
                        class="border-border block size-6 rounded border"
                        [style.background]="'var(--' + token.name + ')'"
                      ></span>
                    </xui-td>
                  }
                  <xui-td class="min-w-0 flex-1">
                    <code xuiCode class="text-xs wrap-anywhere whitespace-normal">--{{ token.name }}</code>
                    @if (token.derived) {
                      <xui-tag minimal class="ms-2">derived</xui-tag>
                    }
                  </xui-td>
                  <xui-td class="w-28 min-w-0 shrink">
                    @if (token.utility) {
                      <code xuiCode class="text-xs wrap-anywhere whitespace-normal">{{ token.utility }}</code>
                    } @else {
                      <span xuiText color="subtle">—</span>
                    }
                  </xui-td>
                </xui-tr>
              }
            </xui-table>
          </section>
        }
      </article>

      <docs-table-of-contents class="hidden xl:block" [entries]="toc" />
    </div>
  `
})
export class Theming {
  protected readonly tokenCount = TOKENS.length;

  protected readonly groups = Object.keys(GROUP_LABEL)
    .map(key => ({
      key,
      label: GROUP_LABEL[key],
      blurb: GROUP_BLURB[key],
      swatch: SWATCH_GROUPS.has(key),
      tokens: TOKENS.filter((token: DocsToken) => token.group === key)
    }))
    .filter(group => group.tokens.length > 0);

  protected readonly toc: TocEntry[] = [
    { id: 'how', label: 'How it works', level: 2 },
    { id: 'switching', label: 'Switching themes', level: 2 },
    { id: 'retheming', label: 'Re-theming', level: 2 },
    { id: 'density', label: 'Control density', level: 2 },
    { id: 'reference', label: 'Token reference', level: 2 },
    ...this.groups.map(group => ({ id: `tokens-${group.key}`, label: group.label, level: 3 as const }))
  ];

  protected readonly switching = `<html class="dark">…</html>

<!-- or, on any subtree -->
<div data-theme="light">…</div>`;

  protected readonly noFlash = `// index.html, before the app bundle
const stored = localStorage.getItem('xui-docs-theme');
const dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.add(dark ? 'dark' : 'light');`;

  protected readonly retheme = `@import 'tailwindcss';
@import '@xui/core/styles/theme.css';

:root {
  --primary: var(--color-violet-600);
  --surface-inset: var(--color-zinc-50);
}`;

  protected readonly density = `:root {
  --control-height-sm: 1.5rem;    /* 24px */
  --control-height-md: 1.875rem;  /* 30px — the default step */
  --control-height-lg: 2.5rem;    /* 40px */

  --control-padding-sm: 0.5rem;
  --control-padding-md: 0.75rem;
  --control-padding-lg: 1rem;
}`;
}
