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
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matArrowForwardRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { defaultXDateFormat, defaultXDateParse, injectXDateAdapter } from '@xui/core/date-time';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiDateRangePickerImports, type XuiDateRange } from '@xui/date-range-picker';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import type { ClassValue } from 'clsx';

type Boundary = 'start' | 'end';

/**
 * A date-range field: two text inputs (start → end) that share one popover
 * calendar. Focusing either field opens the range picker; typing a boundary
 * parses just that end. `[(value)]` two-way binding. It is a full
 * `ControlValueAccessor`, so `ngModel`/`formControl` bind to it directly.
 */
@Component({
  selector: 'xui-date-range-input',
  imports: [NgIcon, XuiIcon, XuiPopoverImports, XuiDateRangePickerImports],
  providers: [provideXValueAccessor(() => XuiDateRangeInput)],
  template: `
    <div
      [class]="groupClass()"
      [xuiPopover]="panel"
      [open]="open()"
      (openChange)="onOpenChange($event)"
      [role]="'dialog'"
      [bare]="true"
      [disabled]="isDisabled()"
      placement="bottom-start"
    >
      <input
        type="text"
        [class]="fieldClass()"
        [placeholder]="startPlaceholder()"
        [disabled]="isDisabled()"
        [value]="displayValue('start')"
        (input)="onType('start', $event)"
        (blur)="onBlur('start')"
        (keydown.enter)="commitTyped('start')"
      />
      <ng-icon xui name="matArrowForwardRound" size="sm" class="text-foreground-muted shrink-0" />
      <input
        type="text"
        [class]="fieldClass()"
        [placeholder]="endPlaceholder()"
        [disabled]="isDisabled()"
        [value]="displayValue('end')"
        (input)="onType('end', $event)"
        (blur)="onBlur('end')"
        (keydown.enter)="commitTyped('end')"
      />
    </div>

    <ng-template #panel>
      <xui-date-range-picker
        [value]="value()"
        [min]="min()"
        [max]="max()"
        [allowSingleDayRange]="allowSingleDayRange()"
        (valueChange)="onPick($event)"
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
export class XuiDateRangeInput<T = Date> implements ControlValueAccessor {
  private readonly adapter = injectXDateAdapter<T>();

  readonly class = input<ClassValue>('');

  /** The chosen range. Two-way bindable with `[(value)]`. */
  readonly value = model<XuiDateRange<T>>({ start: null, end: null });

  readonly min = input<T | null>(null);
  readonly max = input<T | null>(null);
  readonly allowSingleDayRange = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly startPlaceholder = input<string>('Start date');
  readonly endPlaceholder = input<string>('End date');
  readonly locale = input<string | undefined>(undefined);

  readonly formatDate = input<(date: T, locale?: string) => string>(defaultXDateFormat(this.adapter));

  readonly parseDate = input<(text: string) => T | null>(defaultXDateParse);

  protected readonly open = model(false);
  private readonly typed = signal<{ start: string | null; end: string | null }>({ start: null, end: null });

  protected readonly cva = createXValueAccessor<XuiDateRange<T> | null>({
    onWrite: range => {
      // A form write replaces any half-typed text — the display must show it.
      this.typed.set({ start: null, end: null });
      this.value.set(range ?? { start: null, end: null });
    },
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));
  protected readonly groupClass = computed(() =>
    xui(
      'border-border bg-surface-inset flex h-(--control-height-md) w-full min-w-72 items-center gap-2 rounded-lg border px-(--control-padding-md) text-sm',
      'focus-within:border-focus transition-colors',
      this.isDisabled() && 'cursor-not-allowed opacity-50'
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

    const value = this.value()[boundary];
    return value == null ? '' : this.formatDate()(value, this.locale());
  }

  protected onType(boundary: Boundary, event: Event): void {
    this.typed.update(state => ({ ...state, [boundary]: (event.target as HTMLInputElement).value }));
  }

  protected onBlur(boundary: Boundary): void {
    this.commitTyped(boundary);
    this.cva.markTouched();
  }

  protected onOpenChange(open: boolean): void {
    this.open.set(open);
    if (!open) {
      this.cva.markTouched();
    }
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

    this.commit({ ...this.value(), [boundary]: next });
  }

  protected onPick(range: XuiDateRange<T>): void {
    this.typed.set({ start: null, end: null });
    this.commit(range);
  }

  /** The single write path for user edits — typed boundaries or a calendar pick. */
  private commit(range: XuiDateRange<T>): void {
    this.value.set(range);
    this.cva.notifyChange(range);
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
