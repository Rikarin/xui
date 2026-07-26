import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matCloseRound, matInfoRound, matPriorityHighRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';
import { injectXuiResultConfig } from './result.token';

export type XuiResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

/**
 * A result / status page — a large status glyph over a title and subtitle, with
 * optional body content and an `[xuiResultExtra]` action slot. `status` picks the
 * icon and tint (success/error/info/warning) or shows an HTTP code (404/403/500).
 *
 * ```html
 * <xui-result status="success" title="Payment received" subtitle="Order #1024 is confirmed.">
 *   <button xuiButton xuiResultExtra>Go home</button>
 * </xui-result>
 * ```
 */
@Component({
  selector: 'xui-result',
  template: `
    <div [class]="iconWrapClass()">
      @switch (status()) {
        @case ('success') {
          <ng-icon xui size="2.25rem" [class]="glyphClass()" name="matCheckRound" />
        }
        @case ('error') {
          <ng-icon xui size="2.25rem" [class]="glyphClass()" name="matCloseRound" />
        }
        @case ('warning') {
          <ng-icon xui size="2.25rem" [class]="glyphClass()" name="matPriorityHighRound" />
        }
        @default {
          @if (status() === '404' || status() === '403' || status() === '500') {
            <span class="text-foreground-muted text-3xl font-bold tabular-nums">{{ status() }}</span>
          } @else {
            <ng-icon xui size="2.25rem" [class]="glyphClass()" name="matInfoRound" />
          }
        }
      }
    </div>

    @if (title()) {
      <h2 class="text-foreground text-xl font-semibold">{{ title() }}</h2>
    }
    @if (subtitle()) {
      <p class="text-foreground-muted max-w-prose">{{ subtitle() }}</p>
    }
    <div class="w-full empty:hidden"><ng-content /></div>
    <div class="mt-4 flex flex-wrap justify-center gap-2 empty:hidden">
      <ng-content select="[xuiResultExtra]" />
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matCheckRound, matCloseRound, matInfoRound, matPriorityHighRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiResult {
  private readonly config = injectXuiResultConfig();

  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** What happened. Picks the glyph and its tint; the HTTP codes render as the number itself. */
  readonly status = input<XuiResultStatus>(this.config.status);
  /** The headline — what the outcome was. */
  readonly title = input<string>('');
  /** Supporting detail under the title. Project buttons as content for what to do next. */
  readonly subtitle = input<string>('');

  protected readonly computedClass = computed(() =>
    xui('flex flex-col items-center gap-3 p-8 text-center', this.class())
  );

  protected readonly glyphClass = computed(() => xui(tintText(this.status())));
  protected readonly iconWrapClass = computed(() =>
    xui('mb-2 flex size-16 items-center justify-center rounded-full', tintBg(this.status()))
  );
}

const tintText = (status: XuiResultStatus): string =>
  status === 'success'
    ? 'text-success'
    : status === 'error'
      ? 'text-error'
      : status === 'warning'
        ? 'text-warning'
        : 'text-info';

const tintBg = (status: XuiResultStatus): string =>
  status === 'success'
    ? 'bg-success/10'
    : status === 'error'
      ? 'bg-error/10'
      : status === 'warning'
        ? 'bg-warning/10'
        : status === 'info'
          ? 'bg-info/10'
          : 'bg-surface-inset';
