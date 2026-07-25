import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiSegmentedControlImports, type XuiSegmentedOption } from '@xui/segmented-control';
import { XuiSliderImports } from '@xui/slider';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { XuiTooltipImports } from '@xui/tooltip';
import { Theme } from '../core/theme';
import { ThemeBuilder } from '../core/theme-builder';
import { COLOUR_GROUPS, DENSITY_TOKENS, PRESETS, type DensityToken, type ThemeScope } from '../core/theme-tokens';
import { CodeBlock } from '../shared/code-block';
import { ContrastReport } from '../shared/contrast-report';
import { ThemePreview } from '../shared/theme-preview';
import { TokenSwatch } from '../shared/token-swatch';

const SCOPES: XuiSegmentedOption<ThemeScope>[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

/**
 * Build a theme by editing the tokens it declares, with the site itself as the preview.
 *
 * The scope switch is the site's own light/dark toggle rather than a second control: you edit the
 * theme you are looking at, which keeps one column of swatches instead of two and means the page
 * around them is always showing the truth.
 *
 * The token groups are plain sections rather than an accordion, and the swatch column never gets a
 * scroll container of its own. `@xui/color-picker` floats its panel with `position: absolute`
 * rather than through the CDK overlay, so anything that clips or scrolls above it cuts the panel
 * off at the edge — an accordion's collapse wrapper included.
 *
 * The preset buttons carry a tooltip rather than a `title` attribute, which would become the
 * button's accessible name and hide the label it visibly carries.
 */
@Component({
  selector: 'docs-theme-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    XuiButtonImports,
    XuiCalloutImports,
    XuiSegmentedControlImports,
    XuiSliderImports,
    XuiTagImports,
    XuiTextImports,
    XuiTooltipImports,
    CodeBlock,
    ContrastReport,
    ThemePreview,
    TokenSwatch
  ],
  template: `
    <article class="min-w-0">
      <h1 xuiHeading [level]="1">Theme builder</h1>
      <p xuiText color="muted" size="lg" class="mt-3 max-w-3xl">
        Every colour in the library resolves through one token layer, so a theme is a handful of CSS declarations rather
        than a fork. Change them here and the whole site follows — this page, the sidebar, the header. When it looks
        right, copy the CSS out.
      </p>

      <div
        class="border-border bg-surface mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border p-3 sm:p-4"
      >
        <div class="flex items-center gap-2">
          <span xuiText size="sm" weight="medium">Editing</span>
          <xui-segmented-control
            aria-label="Theme to edit"
            [options]="scopes"
            [value]="theme.mode()"
            (valueChange)="onScope($event)"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span xuiText size="sm" weight="medium">Presets</span>
          @for (preset of presets; track preset.key) {
            <button
              xuiButton
              variant="outline"
              size="sm"
              type="button"
              [xuiTooltip]="preset.blurb"
              (click)="apply(preset)"
            >
              {{ preset.label }}
            </button>
          }
        </div>

        <div class="ms-auto flex items-center gap-2">
          @if (builder.isCustomised()) {
            <xui-tag minimal intent="primary">{{ builder.changeCount() }} changed</xui-tag>
          }
          <button
            xuiButton
            variant="ghost"
            size="sm"
            type="button"
            [disabled]="!builder.isCustomised()"
            (click)="resetAll()"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div aria-label="Tokens" class="space-y-8">
          @for (group of groups; track group.key) {
            <section>
              <h2 xuiHeading [level]="3" class="mb-1 scroll-mt-20" [id]="'group-' + group.key">{{ group.label }}</h2>
              <p xuiText color="muted" size="sm" class="mb-3">{{ group.blurb }}</p>
              <div class="space-y-2">
                @for (token of group.tokens; track token.name) {
                  <docs-token-swatch [token]="token" [scope]="theme.mode()" />
                }
              </div>
            </section>
          }

          <section>
            <h2 xuiHeading [level]="3" class="mb-1 scroll-mt-20" id="group-density">Density</h2>
            <p xuiText color="muted" size="sm" class="mb-4">
              One scale for everything you click or type into, so a button, an input and a date field on the same row
              line up. Declared once — a control is not a different height in the dark.
            </p>
            <div class="space-y-5">
              @for (token of densityTokens; track token.name) {
                <div>
                  <div class="mb-1 flex items-baseline justify-between gap-2">
                    <span xuiText size="sm">{{ token.label }}</span>
                    <code class="text-foreground-subtle font-mono text-xs">{{ pixels(token) }}px</code>
                  </div>
                  <xui-slider
                    [min]="token.min"
                    [max]="token.max"
                    [stepSize]="token.step"
                    [labelStepSize]="token.max - token.min"
                    [value]="pixels(token)"
                    (valueChange)="onDensity(token, $event)"
                  />
                </div>
              }
            </div>
          </section>
        </div>

        <section
          aria-label="Preview"
          class="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
        >
          <h2 xuiHeading [level]="2" class="mb-3 scroll-mt-20" id="preview">Preview</h2>
          <docs-theme-preview />
        </section>
      </div>

      <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="contrast">Contrast</h2>
      <p xuiText color="muted" class="mb-4 max-w-3xl">
        Measured against what is on screen in the theme you are editing, derived steps included. WCAG 2.2 asks for 4.5
        on body text and 3 on anything non-text, like a border or the focus ring.
      </p>
      <docs-contrast-report />

      <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="css">Your theme</h2>
      @if (builder.isCustomised()) {
        <p xuiText color="muted" class="mb-4 max-w-3xl">
          Paste this after the theme import in your application's stylesheet. It is the same CSS this page has applied
          to itself, so what you have been looking at is what you are taking away.
        </p>
        <docs-code [code]="builder.css()" lang="css" />
        <p xuiText color="muted" size="sm" class="mt-3 max-w-3xl">
          The derived steps of each intent — <code xuiCode>-darker</code>, <code xuiCode>-lighter</code>,
          <code xuiCode>-subtle</code>, <code xuiCode>-muted</code>, <code xuiCode>-emphasis</code> — are computed from
          the base colour, which is why they are not in the list. Elevation, motion and the alpha overlays are not
          editable here; the <a class="text-link hover:text-link-hover underline" href="/docs/theming">theming page</a>
          documents them for hand-editing.
        </p>
      } @else {
        <xui-callout color="none" title="Nothing changed yet" class="max-w-3xl">
          Pick a preset or open a group and click a swatch. The CSS to copy appears here, and your theme is kept in this
          browser until you reset it.
        </xui-callout>
      }
    </article>
  `
})
export class ThemeBuilderPage {
  protected readonly theme = inject(Theme);
  protected readonly builder = inject(ThemeBuilder);

  protected readonly groups = COLOUR_GROUPS;
  protected readonly densityTokens = DENSITY_TOKENS;
  protected readonly presets = PRESETS;
  protected readonly scopes = SCOPES;

  /**
   * The stock density in pixels, which is what a slider without an override should sit at. Read
   * once — it cannot move, since overriding a token is what this page does instead of changing it.
   * Empty until the browser has been asked, which is why the reader below falls back.
   */
  private readonly stockPx = signal<Record<string, number | undefined>>({});

  constructor() {
    afterNextRender(() => {
      const sizes: Record<string, number> = {};

      for (const token of DENSITY_TOKENS) {
        sizes[token.name] = Math.round(this.builder.stockLength(token.name));
      }

      this.stockPx.set(sizes);
    });
  }

  /**
   * Sliders work in pixels, which is what a person thinks in; the token is emitted as rem, which is
   * what `theme.css` declares. The conversion assumes a 16px root, the same assumption the stock
   * scale is written against.
   */
  protected pixels(token: DensityToken): number {
    const override = this.builder.densityOf(token.name);

    return override ? Math.round(Number.parseFloat(override) * 16) : (this.stockPx()[token.name] ?? token.min);
  }

  protected onScope(scope: ThemeScope | null): void {
    if (scope) {
      this.theme.mode.set(scope);
    }
  }

  protected onDensity(token: DensityToken, px: number): void {
    this.builder.setDensity(token.name, `${px / 16}rem`);
  }

  protected apply(preset: (typeof PRESETS)[number]): void {
    this.builder.applyPreset(preset);
  }

  protected resetAll(): void {
    this.builder.reset();
  }
}
