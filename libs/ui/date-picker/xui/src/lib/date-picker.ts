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
  output,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matChevronLeftRound, matChevronRightRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { arrowDirectionOnAxis, injectXDirection } from '@xui/core/a11y';
import { buildMonthGrid, type CalendarDay, monthYearLabel, weekdayLabels } from '@xui/core/calendar';
import { injectDateAdapter } from '@xui/core/date-time';
import { XuiIcon } from '@xui/icon';
import type { ClassValue } from 'clsx';

/**
 * An inline month calendar. Click a day to select it; arrow keys move by day/week,
 * PageUp/PageDown by month, Home/End to week ends, Enter/Space select.
 * `[(selected)]` two-way binding. `T` is the date type of the active `DateAdapter`
 * (a `Date` by default).
 */
@Component({
  selector: 'xui-date-picker',
  imports: [NgIcon, XuiIcon],
  template: `
    <div class="mb-2 flex items-center justify-between">
      <button type="button" [class]="navClass()" aria-label="Previous month" (click)="shiftMonth(-1)">
        <ng-icon xui name="matChevronLeftRound" size="sm" />
      </button>
      <div class="text-foreground text-sm font-semibold" aria-live="polite">{{ headerLabel() }}</div>
      <button type="button" [class]="navClass()" aria-label="Next month" (click)="shiftMonth(1)">
        <ng-icon xui name="matChevronRightRound" size="sm" />
      </button>
    </div>

    <!-- Key events bubble up from the focused day button (roving tabindex); the
         grid itself is not a tab stop. -->
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <table role="grid" class="w-full border-collapse" (keydown)="onKeydown($event)">
      <thead>
        <tr>
          @for (label of weekdays(); track $index) {
            <th class="text-foreground-muted pb-1 text-center text-xs font-medium">{{ label }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (week of weeks(); track $index) {
          <tr>
            @for (day of week; track $index) {
              <!-- The td is the gridcell, so selection is announced there;
                   aria-selected on the inner button would be invalid. -->
              <td class="p-0 text-center" [attr.aria-selected]="isSelected(day.date)">
                <button
                  type="button"
                  [class]="dayClass(day)"
                  [disabled]="day.disabled"
                  [attr.aria-current]="day.isToday ? 'date' : null"
                  [tabindex]="isFocusable(day.date) ? 0 : -1"
                  (click)="select(day.date)"
                >
                  {{ day.label }}
                </button>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>

    @if (showActionsBar()) {
      <div class="border-border mt-2 flex justify-between border-t pt-2">
        <button type="button" [class]="actionClass()" (click)="selectToday()">Today</button>
        <button type="button" [class]="actionClass()" (click)="clear()">Clear</button>
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matChevronLeftRound, matChevronRightRound })]
})
export class XuiDatePicker<T = Date> {
  private readonly adapter = injectDateAdapter<T>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly direction = injectXDirection();

  readonly class = input<ClassValue>('');

  /** The selected date. Two-way bindable with `[(selected)]`. */
  readonly selected = model<T | null>(null);

  readonly min = input<T | null>(null);
  readonly max = input<T | null>(null);
  readonly dateFilter = input<((date: T) => boolean) | null>(null);

  readonly firstDayOfWeek = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly locale = input<string | undefined>(undefined);

  /** Show a Today/Clear action bar under the grid. */
  readonly showActionsBar = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly dateChange = output<T | null>();

  // The month currently on screen; seeded from the selection (or today).
  private readonly viewDate = linkedSignal<T | null, T>({
    source: this.selected,
    computation: (selected, previous) => selected ?? previous?.value ?? this.adapter.now()
  });

  // The keyboard-focused day within the grid.
  private readonly focusedDate = signal<T | null>(null);

  protected readonly computedClass = computed(() =>
    xui('bg-surface-raised border-border inline-block rounded-lg border p-3', this.class())
  );
  protected readonly navClass = computed(() =>
    xui(
      'text-foreground-muted hover:bg-surface-inset hover:text-foreground flex size-7 items-center justify-center rounded'
    )
  );
  protected readonly actionClass = computed(() =>
    xui('text-primary hover:bg-primary/10 rounded px-2 py-1 text-xs font-medium')
  );

  protected readonly weekdays = computed(() => weekdayLabels(this.firstDayOfWeek(), this.locale()));
  protected readonly headerLabel = computed(() => monthYearLabel(this.adapter, this.viewDate(), this.locale()));

  protected readonly weeks = computed(() =>
    buildMonthGrid(this.adapter, this.viewDate(), {
      min: this.min(),
      max: this.max(),
      dateFilter: this.dateFilter(),
      firstDayOfWeek: this.firstDayOfWeek()
    })
  );

  protected isSelected(date: T): boolean {
    const selected = this.selected();
    return selected != null && this.adapter.isSameDay(date, selected);
  }

  /** The roving-tabindex anchor: the focused day, else selected, else today, else the 1st. */
  protected isFocusable(date: T): boolean {
    const anchor = this.focusedDate() ?? this.selected() ?? this.anchorFallback();
    return this.adapter.isSameDay(date, anchor);
  }

  private anchorFallback(): T {
    const today = this.adapter.now();
    return this.adapter.isSameMonth(today, this.viewDate()) ? today : this.adapter.startOfMonth(this.viewDate());
  }

  protected dayClass(day: CalendarDay<T>): string {
    return xui(
      'flex size-8 items-center justify-center rounded-full text-sm transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      day.inCurrentMonth ? 'text-foreground' : 'text-foreground-subtle',
      !day.disabled && 'hover:bg-surface-inset cursor-pointer',
      day.disabled && 'cursor-not-allowed opacity-40',
      day.isToday && !this.isSelected(day.date) && 'ring-border-strong ring-1',
      this.isSelected(day.date) && 'bg-primary text-primary-foreground hover:bg-primary'
    );
  }

  protected shiftMonth(delta: number): void {
    this.viewDate.set(this.adapter.add(this.viewDate(), { months: delta }));
  }

  protected select(date: T): void {
    this.focusedDate.set(date);
    this.selected.set(date);
    this.dateChange.emit(date);
  }

  protected selectToday(): void {
    const today = this.adapter.now();
    this.viewDate.set(today);
    this.select(today);
  }

  protected clear(): void {
    this.selected.set(null);
    this.dateChange.emit(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const current = this.focusedDate() ?? this.selected() ?? this.anchorFallback();
    let next: T;

    // The month grid runs inline, so the horizontal arrows step a day in reading
    // order — which is right-to-left in an RTL calendar — and the vertical pair
    // always steps a week.
    const inline = arrowDirectionOnAxis(event.key, this.direction(), 'horizontal');
    if (inline) {
      const target =
        inline === 'next' ? this.adapter.add(current, { days: 1 }) : this.adapter.subtract(current, { days: 1 });
      this.moveFocusTo(event, target);
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        next = this.adapter.subtract(current, { days: 7 });
        break;
      case 'ArrowDown':
        next = this.adapter.add(current, { days: 7 });
        break;
      case 'PageUp':
        next = this.adapter.subtract(current, { months: 1 });
        break;
      case 'PageDown':
        next = this.adapter.add(current, { months: 1 });
        break;
      case 'Home':
        next = this.adapter.startOfMonth(current);
        break;
      case 'End':
        next = this.adapter.endOfMonth(current);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.select(current);
        return;
      default:
        return;
    }

    this.moveFocusTo(event, next);
  }

  /** Move the roving focus to `target`, paging the view when it leaves the month. */
  private moveFocusTo(event: KeyboardEvent, target: T): void {
    event.preventDefault();
    this.focusedDate.set(target);
    if (!this.adapter.isSameMonth(target, this.viewDate())) {
      this.viewDate.set(target);
    }
    this.focusActiveCell();
  }

  private focusActiveCell(): void {
    // Roving tabindex updates on the next microtask; move DOM focus to it.
    queueMicrotask(() => this.host.nativeElement.querySelector<HTMLElement>('button[tabindex="0"]')?.focus());
  }
}
