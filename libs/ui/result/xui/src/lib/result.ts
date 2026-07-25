import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

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
          <svg viewBox="0 0 24 24" [class]="glyphClass()" fill="none">
            <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        }
        @case ('error') {
          <svg viewBox="0 0 24 24" [class]="glyphClass()" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        }
        @case ('warning') {
          <svg viewBox="0 0 24 24" [class]="glyphClass()" fill="none">
            <path d="M12 8v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
          </svg>
        }
        @default {
          @if (status() === '404' || status() === '403' || status() === '500') {
            <span class="text-foreground-muted text-3xl font-bold tabular-nums">{{ status() }}</span>
          } @else {
            <svg viewBox="0 0 24 24" [class]="glyphClass()" fill="none">
              <path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="12" cy="7.5" r="1.1" fill="currentColor" />
            </svg>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiResult {
  readonly class = input<ClassValue>('');

  readonly status = input<ResultStatus>('info');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');

  protected readonly computedClass = computed(() =>
    xui('flex flex-col items-center gap-3 p-8 text-center', this.class())
  );

  protected readonly glyphClass = computed(() => xui('h-9 w-9', tintText(this.status())));
  protected readonly iconWrapClass = computed(() =>
    xui('mb-2 flex h-16 w-16 items-center justify-center rounded-full', tintBg(this.status()))
  );
}

const tintText = (status: ResultStatus): string =>
  status === 'success'
    ? 'text-success'
    : status === 'error'
      ? 'text-error'
      : status === 'warning'
        ? 'text-warning'
        : 'text-info';

const tintBg = (status: ResultStatus): string =>
  status === 'success'
    ? 'bg-success/10'
    : status === 'error'
      ? 'bg-error/10'
      : status === 'warning'
        ? 'bg-warning/10'
        : status === 'info'
          ? 'bg-info/10'
          : 'bg-surface-inset';
