import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronLeftRound, matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { buildMonthGrid, monthYearLabel, weekdayLabels, type XCalendarDay } from '@xui/core/calendar';
import { injectXDateAdapter, type XDateAdapter } from '@xui/core/date-time';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';

/** A `[start, end]` date range; either end may be `null` while selecting. */
export interface XuiDateRange<T> {
  start: T | null;
  end: T | null;
}

/**
 * A multi-month calendar for choosing a date range. The first click sets the
 * start, the second the end (hovering previews the span); clicking again starts a
 * new range. `[(value)]` two-way binding; `T` is the active `DateAdapter`'s type.
 * It is a full `ControlValueAccessor`, so `ngModel`/`formControl` bind to it
 * directly.
 */
@Component({
  selector: 'xui-date-range-picker',
  imports: [NgIcon, XuiIcon],
  providers: [provideXValueAccessor(() => XuiDateRangePicker)],
  template: `
    <div class="flex gap-6">
      @for (offset of monthOffsets(); track offset) {
        <div>
          <div class="mb-2 flex items-center justify-between">
            @if (offset === 0) {
              <button
                type="button"
                [class]="navClass()"
                aria-label="Previous month"
                [disabled]="isDisabled()"
                (click)="shiftMonth(-1)"
              >
                <ng-icon xui name="matChevronLeftRound" size="sm" />
              </button>
            } @else {
              <span class="size-7"></span>
            }
            <div class="text-foreground text-sm font-semibold">{{ monthLabel(offset) }}</div>
            @if (offset === monthOffsets().length - 1) {
              <button
                type="button"
                [class]="navClass()"
                aria-label="Next month"
                [disabled]="isDisabled()"
                (click)="shiftMonth(1)"
              >
                <ng-icon xui name="matChevronRightRound" size="sm" />
              </button>
            } @else {
              <span class="size-7"></span>
            }
          </div>

          <!-- Separated, with the spacing taken back out: the collapsed model has browsers ignore
               border-radius on a cell, which is what rounds the ends of the range band. The zero
               spacing keeps the grid laid out exactly as the collapsed model did. -->
          <table role="grid" class="border-separate border-spacing-0">
            <thead>
              <tr>
                @for (label of weekdays(); track $index) {
                  <th class="text-foreground-muted pb-1 text-center text-xs font-medium">{{ label }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (week of grids()[offset]; track $index) {
                <tr>
                  @for (day of week; track $index) {
                    <!-- A day belonging to a neighbouring month is left blank: with the months
                         side by side it is already on screen in its own grid, and drawing it twice
                         gave a selected endpoint two circles. -->
                    @if (!day.inCurrentMonth) {
                      <td class="p-0"></td>
                    } @else {
                      <!-- Selection belongs on the gridcell, not the button. -->
                      <td [class]="cellClass(day)" [attr.aria-selected]="isEndpoint(day.date)">
                        <button
                          type="button"
                          [class]="dayClass(day)"
                          [disabled]="day.disabled || isDisabled()"
                          (click)="onClick(day.date)"
                          (mouseenter)="hover.set(day.date)"
                        >
                          {{ day.label }}
                        </button>
                      </td>
                    }
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()',
    '(focusout)': 'onFocusOut($event)'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matChevronLeftRound, matChevronRightRound })]
})
export class XuiDateRangePicker<T = Date> implements ControlValueAccessor {
  private readonly adapter: XDateAdapter<T> = injectXDateAdapter<T>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly class = input<ClassValue>('');

  /** The chosen range. Two-way bindable with `[(value)]`. */
  readonly value = model<XuiDateRange<T>>({ start: null, end: null });

  readonly min = input<T | null>(null);
  readonly max = input<T | null>(null);
  readonly dateFilter = input<((date: T) => boolean) | null>(null);
  readonly firstDayOfWeek = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly locale = input<string | undefined>(undefined);

  /** How many contiguous months to show (1 or 2). */
  readonly months = input<number, NumberInput>(2, { transform: numberAttribute });

  /** Allow the start and end to be the same day. */
  readonly allowSingleDayRange = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<XuiDateRange<T> | null>({
    onWrite: range => this.value.set(range ?? { start: null, end: null }),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  protected readonly hover = signal<T | null>(null);

  // The left-most month on screen, seeded from the range start (or today).
  private readonly viewDate = linkedSignal<XuiDateRange<T>, T>({
    source: this.value,
    computation: (range, previous) => range.start ?? previous?.value ?? this.adapter.now()
  });

  protected readonly monthOffsets = computed(() => Array.from({ length: Math.max(1, this.months()) }, (_, i) => i));
  protected readonly weekdays = computed(() => weekdayLabels(this.firstDayOfWeek(), this.locale()));

  protected readonly grids = computed(() =>
    this.monthOffsets().map(offset =>
      buildMonthGrid(this.adapter, this.adapter.add(this.viewDate(), { months: offset }), {
        min: this.min(),
        max: this.max(),
        dateFilter: this.dateFilter(),
        firstDayOfWeek: this.firstDayOfWeek()
      })
    )
  );

  protected readonly computedClass = computed(() =>
    xui(
      'bg-surface-raised border-border inline-block rounded-lg border p-3',
      this.isDisabled() && 'opacity-50',
      this.class()
    )
  );
  protected readonly navClass = computed(() =>
    xui(
      'text-foreground-muted hover:bg-surface-inset hover:text-foreground flex size-7 items-center justify-center rounded'
    )
  );

  protected monthLabel(offset: number): string {
    return monthYearLabel(this.adapter, this.adapter.add(this.viewDate(), { months: offset }), this.locale());
  }

  protected isEndpoint(date: T): boolean {
    const { start, end } = this.value();
    return (start != null && this.adapter.isSameDay(date, start)) || (end != null && this.adapter.isSameDay(date, end));
  }

  /** The provisional end while only a start is chosen (uses the hovered day). */
  private effectiveEnd(): T | null {
    const { start, end } = this.value();
    if (end != null) {
      return end;
    }
    return start != null ? this.hover() : null;
  }

  private inRange(date: T): boolean {
    const { start } = this.value();
    const end = this.effectiveEnd();
    if (start == null || end == null) {
      return false;
    }

    const [lo, hi] = this.adapter.isAfter(start, end) ? [end, start] : [start, end];
    return (
      !this.adapter.isBefore(date, this.adapter.startOfDay(lo)) &&
      !this.adapter.isAfter(date, this.adapter.startOfDay(hi))
    );
  }

  /**
   * The band behind the days inside the range, endpoints included.
   *
   * Its ends are rounded to the day circle's own radius, so the band finishes on the same
   * silhouette the circle draws. Squaring them off left a tinted corner poking out past the curve
   * at each end — the band read as a box drawn around the selection rather than a line joining it.
   */
  protected cellClass(day: XCalendarDay<T>): string {
    const side = this.endpointSide(day.date);

    return xui(
      'p-0 text-center',
      side !== null || (this.spansDays() && this.inRange(day.date)) ? 'bg-primary/10' : '',
      side === 'start' && 'rounded-s-full',
      side === 'end' && 'rounded-e-full'
    );
  }

  /** The range's two ends as `[earlier, later]`, or null while it is still incomplete. */
  private bounds(): [T, T] | null {
    const { start } = this.value();
    const end = this.effectiveEnd();

    if (start == null || end == null) {
      return null;
    }

    return this.adapter.isAfter(start, end) ? [end, start] : [start, end];
  }

  /** Whether the range covers more than a single day — a one-day range has nothing to join up. */
  private spansDays(): boolean {
    const bounds = this.bounds();

    return bounds != null && !this.adapter.isSameDay(bounds[0], bounds[1]);
  }

  /** Which end of the range a day sits at, once the range covers more than one day. */
  private endpointSide(date: T): 'start' | 'end' | null {
    const bounds = this.bounds();

    if (!bounds || !this.spansDays()) {
      return null;
    }

    if (this.adapter.isSameDay(date, bounds[0])) {
      return 'start';
    }

    return this.adapter.isSameDay(date, bounds[1]) ? 'end' : null;
  }

  protected dayClass(day: XCalendarDay<T>): string {
    return xui(
      'flex size-8 items-center justify-center rounded-full text-sm transition-colors',
      day.inCurrentMonth ? 'text-foreground' : 'text-foreground-subtle',
      !day.disabled && 'hover:bg-surface-inset cursor-pointer',
      day.disabled && 'cursor-not-allowed opacity-40',
      day.isToday && !this.isEndpoint(day.date) && 'ring-border-strong ring-1',
      this.isEndpoint(day.date) && 'bg-primary text-primary-foreground hover:bg-primary'
    );
  }

  protected shiftMonth(delta: number): void {
    this.viewDate.set(this.adapter.add(this.viewDate(), { months: delta }));
  }

  protected onClick(date: T): void {
    if (this.isDisabled()) {
      return;
    }

    const { start, end } = this.value();

    // Start a fresh range if there's no start, both ends are set, or the click is
    // before the current start.
    if (start == null || end != null || this.adapter.isBefore(date, start)) {
      this.commit({ start: date, end: null });
      return;
    }

    // Second click: complete the range (guard single-day unless allowed).
    if (this.adapter.isSameDay(date, start) && !this.allowSingleDayRange()) {
      return;
    }

    this.commit({ start, end: date });
  }

  private commit(range: XuiDateRange<T>): void {
    // `model.set` emits `valueChange` for `[(value)]` / `(valueChange)` consumers.
    this.value.set(range);
    this.cva.notifyChange(range);
  }

  /** Touched fires when focus leaves the calendar, not while moving inside it. */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) {
      this.cva.markTouched();
    }
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
