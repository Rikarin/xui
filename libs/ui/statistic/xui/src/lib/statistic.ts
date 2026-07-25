import { NumberInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';

/**
 * A single numeric statistic — a muted title over a large value with optional
 * prefix/suffix (string inputs or projected `[xuiStatisticPrefix]` /
 * `[xuiStatisticSuffix]` content). Numbers are grouped and rounded to `precision`.
 *
 * ```html
 * <xui-statistic title="Active users" [value]="1128" />
 * <xui-statistic title="Balance" [value]="112893.5" [precision]="2" prefix="$" />
 * ```
 */
@Component({
  selector: 'xui-statistic',
  template: `
    <div [class]="titleClass()">{{ title() }}<ng-content select="[xuiStatisticTitle]" /></div>
    <div [class]="valueRowClass()">
      @if (prefix()) {
        <span class="text-base font-normal">{{ prefix() }}</span>
      }
      <ng-content select="[xuiStatisticPrefix]" />
      <span>{{ formattedValue() }}</span>
      @if (suffix()) {
        <span class="text-foreground-muted text-base font-normal">{{ suffix() }}</span>
      }
      <ng-content select="[xuiStatisticSuffix]" />
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiStatistic {
  readonly class = input<ClassValue>('');

  readonly title = input<string>('');
  readonly value = input<number | string>('');
  /** Decimal places for numeric values. */
  readonly precision = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly prefix = input<string>('');
  readonly suffix = input<string>('');

  protected readonly formattedValue = computed(() => formatStatValue(this.value(), this.precision()));

  protected readonly computedClass = computed(() => xui('block', this.class()));
  protected readonly titleClass = computed(() => xui('text-foreground-muted mb-1 text-sm'));
  protected readonly valueRowClass = computed(() =>
    xui('text-foreground flex items-baseline gap-1 text-2xl font-semibold tabular-nums')
  );
}

export function formatStatValue(value: number | string, precision: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return String(value);
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
}
