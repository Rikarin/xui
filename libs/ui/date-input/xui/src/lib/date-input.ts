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
import { matCalendarTodayRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { toJsDate } from '@xui/core/calendar';
import { injectDateAdapter } from '@xui/core/date-time';
import { XuiDatePickerImports } from '@xui/date-picker';
import { XuiIcon } from '@xui/icon';
import { XuiPopoverImports } from '@xui/popover';
import type { ClassValue } from 'clsx';

/**
 * A date field: a text input paired with a popover calendar. Type a date (parsed
 * best-effort, or via a custom `parseDate`) or pick one from the calendar.
 * `[(value)]` two-way binding; `T` is the active `DateAdapter`'s type (`Date`
 * by default).
 */
@Component({
  selector: 'xui-date-input',
  imports: [NgIcon, XuiIcon, XuiPopoverImports, XuiDatePickerImports],
  template: `
    <div [class]="groupClass()">
      <input
        type="text"
        [class]="fieldClass()"
        [value]="displayValue()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        (input)="onType($event)"
        (blur)="commitTyped()"
        (keydown.enter)="commitTyped()"
      />
      <button
        type="button"
        [class]="triggerClass()"
        aria-label="Open calendar"
        [disabled]="disabled()"
        [xuiPopover]="panel"
        [(open)]="open"
        [role]="'dialog'"
        [minimal]="true"
        placement="bottom-end"
      >
        <ng-icon xui name="matCalendarTodayRound" size="sm" />
      </button>
    </div>

    <ng-template #panel>
      <xui-date-picker
        [value]="value()"
        [min]="min()"
        [max]="max()"
        [dateFilter]="dateFilter()"
        [firstDayOfWeek]="firstDayOfWeek()"
        (valueChange)="onPick($event)"
      />
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCalendarTodayRound })]
})
export class XuiDateInput<T = Date> {
  private readonly adapter = injectDateAdapter<T>();

  readonly class = input<ClassValue>('');

  /** The selected date. Two-way bindable with `[(value)]`. */
  readonly value = model<T | null>(null);

  readonly min = input<T | null>(null);
  readonly max = input<T | null>(null);
  readonly dateFilter = input<((date: T) => boolean) | null>(null);
  readonly firstDayOfWeek = input<number>(0);

  readonly placeholder = input<string>('YYYY-MM-DD');
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly closeOnSelection = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
  readonly locale = input<string | undefined>(undefined);

  /** Format a value for the input. Defaults to a locale short date. */
  readonly formatDate = input<(date: T, locale?: string) => string>((date, locale) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
      toJsDate(this.adapter, date)
    )
  );

  /** Parse typed text into a value, or `null` if it can't. Defaults to `Date.parse`. */
  readonly parseDate = input<(text: string) => T | null>(text => {
    const ms = Date.parse(text);
    return Number.isNaN(ms) ? null : (new Date(ms) as unknown as T);
  });

  protected readonly open = model(false);
  private readonly typed = signal<string | null>(null);

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));
  protected readonly groupClass = computed(() =>
    xui(
      'border-border bg-surface-inset flex h-(--control-height-md) w-full min-w-48 items-center rounded-lg border pe-1 ps-(--control-padding-md) text-sm',
      'focus-within:border-focus transition-colors',
      this.disabled() && 'cursor-not-allowed opacity-50'
    )
  );
  protected readonly fieldClass = computed(() =>
    xui('text-foreground placeholder:text-foreground-subtle flex-1 bg-transparent outline-none')
  );
  protected readonly triggerClass = computed(() =>
    xui(
      'text-foreground-muted hover:bg-surface-raised hover:text-foreground flex size-8 items-center justify-center rounded'
    )
  );

  /** The input shows the live typing, else the formatted value. */
  protected readonly displayValue = computed(() => {
    const typed = this.typed();
    if (typed !== null) {
      return typed;
    }

    const value = this.value();
    return value == null ? '' : this.formatDate()(value, this.locale());
  });

  protected onType(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }

  protected commitTyped(): void {
    const typed = this.typed();
    if (typed === null) {
      return;
    }

    this.typed.set(null);
    if (typed.trim() === '') {
      this.setValue(null);
      return;
    }

    const parsed = this.parseDate()(typed);
    if (parsed != null) {
      this.setValue(parsed);
    }
    // On a parse failure, fall back to the formatted current value (display resets).
  }

  protected onPick(date: T | null): void {
    this.typed.set(null);
    this.setValue(date);
    if (this.closeOnSelection()) {
      this.open.set(false);
    }
  }

  private setValue(date: T | null): void {
    this.value.set(date);
  }
}
