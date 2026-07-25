import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { XuiTableImports } from '@xui/table';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { ThemeBuilder } from '../core/theme-builder';
import { contrastRatio } from '../core/theme-css';
import { Theme } from '../core/theme';
import { CONTRAST_PAIRS } from '../core/theme-tokens';

interface ContrastRow {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  min: number;
  passes: boolean;
}

/**
 * Every pair the theme has to keep legible, measured against what is on screen.
 *
 * The colours come back from the browser rather than from the overrides, so a derived step counts
 * too — change `--primary` and the ratio shown for a primary button is the one the derived fill
 * actually produces, not the one the base colour would suggest.
 *
 * WCAG 2.2 thresholds: 4.5 for body text, 3 for non-text UI like a border or a focus ring.
 */
@Component({
  selector: 'docs-contrast-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiTableImports, XuiTagImports, XuiTextImports],
  host: { class: 'block' },
  template: `
    @if (rows().length > 0) {
      <xui-table bordered compact class="w-full">
        <xui-tr>
          <xui-th class="min-w-0 flex-1">Pair</xui-th>
          <xui-th class="w-24 shrink-0">Colours</xui-th>
          <xui-th class="w-20 shrink-0">Ratio</xui-th>
          <xui-th class="w-24 shrink-0">WCAG</xui-th>
        </xui-tr>
        @for (row of rows(); track row.label) {
          <xui-tr>
            <xui-td class="min-w-0 flex-1">{{ row.label }}</xui-td>
            <xui-td class="w-24 shrink-0">
              <span class="flex items-center gap-1">
                <span class="border-border size-4 rounded border" [style.background]="row.foreground"></span>
                <span class="border-border size-4 rounded border" [style.background]="row.background"></span>
              </span>
            </xui-td>
            <xui-td class="w-20 shrink-0">
              <code class="font-mono text-xs">{{ row.ratio.toFixed(2) }}</code>
            </xui-td>
            <xui-td class="w-24 shrink-0">
              <xui-tag minimal [intent]="row.passes ? 'success' : 'danger'">
                {{ row.passes ? 'Pass' : 'Fail' }} {{ row.min }}
              </xui-tag>
            </xui-td>
          </xui-tr>
        }
      </xui-table>
    } @else {
      <p xuiText color="muted" size="sm">Measured in the browser — nothing to report while rendering on the server.</p>
    }
  `
})
export class ContrastReport {
  private readonly builder = inject(ThemeBuilder);
  private readonly theme = inject(Theme);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly rows = signal<ContrastRow[]>([]);

  /** Measuring means adding a probe to the document, which has no business happening mid-hydration. */
  private readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));

    effect(() => {
      // Re-read whenever the theme being built changes, or the scope it is viewed in does. The
      // builder's own effect is created first, so its stylesheet is already on the document here.
      this.builder.css();
      this.theme.mode();

      if (this.ready()) {
        this.measure();
      }
    });
  }

  private measure(): void {
    if (!this.isBrowser) {
      return;
    }

    const scope = this.theme.mode();

    this.rows.set(
      CONTRAST_PAIRS.map(pair => {
        const foreground = this.builder.resolve(scope, pair.foreground);
        const background = this.builder.resolve(scope, pair.background);
        const ratio = contrastRatio(foreground, background) ?? 0;

        return { label: pair.label, foreground, background, ratio, min: pair.min, passes: ratio >= pair.min };
      })
    );
  }
}
