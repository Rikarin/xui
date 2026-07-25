import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matArrowForwardRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { toJsDate } from '@xui/core/calendar';
import { injectDateAdapter } from '@xui/core/date-time';
import { XuiDateRangePickerImports, type XuiDateRange } from '@xui/date-range-picker';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import type { ClassValue } from 'clsx';

type Boundary = 'start' | 'end';

/**
 * A date-range field: two text inputs (start → end) that share one popover
 * calendar. Focusing either field opens the range picker; typing a boundary
 * parses just that end. `[(range)]` two-way binding.
 */
@Component({
  selector: 'xui-date-range-input',
  imports: [NgIcon, XuiIcon, XuiPopoverImports, XuiDateRangePickerImports],
  template: `
    <div
      [class]="groupClass()"
      [xuiPopover]="panel"
      [(isOpen)]="open"
      [role]="'dialog'"
      [minimal]="true"
      [disabled]="disabled()"
      placement="bottom-start"
    >
      <input
        type="text"
        [class]="fieldClass()"
        [placeholder]="startPlaceholder()"
        [disabled]="disabled()"
        [value]="displayValue('start')"
        (input)="onType('start', $event)"
        (blur)="commitTyped('start')"
        (keydown.enter)="commitTyped('start')"
      />
      <ng-icon xui name="matArrowForwardRound" size="sm" class="text-foreground-muted shrink-0" />
      <input
        type="text"
        [class]="fieldClass()"
        [placeholder]="endPlaceholder()"
        [disabled]="disabled()"
        [value]="displayValue('end')"
        (input)="onType('end', $event)"
        (blur)="commitTyped('end')"
        (keydown.enter)="commitTyped('end')"
      />
    </div>

    <ng-template #panel>
      <xui-date-range-picker
        [range]="range()"
        [min]="min()"
        [max]="max()"
        [allowSingleDayRange]="allowSingleDayRange()"
        (rangeChange)="onPick($event)"
      />
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matArrowForwardRound })]
})
export class XuiDateRangeInput<T = Date> {
  private readonly adapter = injectDateAdapter<T>();

  readonly class = input<ClassValue>('');

  /** The chosen range. Two-way bindable with `[(range)]`. */
  readonly range = model<XuiDateRange<T>>({ start: null, end: null });

  readonly min = input<T | null>(null);
  readonly max = input<T | null>(null);
  readonly allowSingleDayRange = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly startPlaceholder = input<string>('Start date');
  readonly endPlaceholder = input<string>('End date');
  readonly locale = input<string | undefined>(undefined);

  readonly formatDate = input<(date: T, locale?: string) => string>((date, locale) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      toJsDate(this.adapter, date)
    )
  );

  readonly parseDate = input<(text: string) => T | null>(text => {
    const ms = Date.parse(text);
    return Number.isNaN(ms) ? null : (new Date(ms) as unknown as T);
  });

  protected readonly open = model(false);
  private readonly typed = signal<{ start: string | null; end: string | null }>({ start: null, end: null });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));
  protected readonly groupClass = computed(() =>
    xui(
      'border-border bg-surface-inset flex h-(--control-height-md) w-full min-w-72 items-center gap-2 rounded-lg border px-(--control-padding-md) text-sm',
      'focus-within:border-focus transition-colors',
      this.disabled() && 'cursor-not-allowed opacity-50'
    )
  );
  protected readonly fieldClass = computed(() =>
    xui('text-foreground placeholder:text-foreground-subtle w-28 flex-1 bg-transparent text-center outline-none')
  );

  protected displayValue(boundary: Boundary): string {
    const typed = this.typed()[boundary];
    if (typed !== null) {
      return typed;
    }

    const value = this.range()[boundary];
    return value == null ? '' : this.formatDate()(value, this.locale());
  }

  protected onType(boundary: Boundary, event: Event): void {
    this.typed.update(state => ({ ...state, [boundary]: (event.target as HTMLInputElement).value }));
  }

  protected commitTyped(boundary: Boundary): void {
    const text = this.typed()[boundary];
    if (text === null) {
      return;
    }

    this.typed.update(state => ({ ...state, [boundary]: null }));

    const next = text.trim() === '' ? null : this.parseDate()(text);
    // An unparseable value leaves the boundary as-is (display resets to it).
    if (text.trim() !== '' && next == null) {
      return;
    }

    this.commit({ ...this.range(), [boundary]: next });
  }

  protected onPick(range: XuiDateRange<T>): void {
    this.typed.set({ start: null, end: null });
    this.commit(range);
  }

  private commit(range: XuiDateRange<T>): void {
    this.range.set(range);
  }
}
