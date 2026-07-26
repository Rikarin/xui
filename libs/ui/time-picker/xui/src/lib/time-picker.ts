import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { injectXDateAdapter } from '@xui/core/date-time';
import type { ClassValue } from 'clsx';

/** How fine the picker edits. */
export type XuiTimePrecision = 'minute' | 'second' | 'millisecond';

const pad = (value: number, length = 2): string => String(value).padStart(length, '0');

/**
 * A time field with hour/minute (and optional second/millisecond) spin buttons.
 * Arrow keys or the input step each field with wrap-around; `useAmPm` switches to
 * a 12-hour clock with an AM/PM toggle. `[(value)]` two-way binding; `T` is the
 * active `DateAdapter`'s type (a `Date` by default).
 */
@Component({
  selector: 'xui-time-picker',
  imports: [],
  template: `
    <div [class]="groupClass()">
      <input
        type="text"
        inputmode="numeric"
        role="spinbutton"
        aria-label="Hours"
        [class]="fieldClass()"
        [disabled]="disabled()"
        [value]="pad(displayHour())"
        [attr.aria-valuenow]="displayHour()"
        (focus)="$any($event.target).select()"
        (input)="onField('hour', $event)"
        (keydown)="onKeydown('hour', $event)"
      />
      <span class="text-foreground-muted text-sm">:</span>
      <input
        type="text"
        inputmode="numeric"
        role="spinbutton"
        aria-label="Minutes"
        [class]="fieldClass()"
        [disabled]="disabled()"
        [value]="pad(minute())"
        [attr.aria-valuenow]="minute()"
        (focus)="$any($event.target).select()"
        (input)="onField('minute', $event)"
        (keydown)="onKeydown('minute', $event)"
      />

      @if (showSeconds()) {
        <span class="text-foreground-muted text-sm">:</span>
        <input
          type="text"
          inputmode="numeric"
          role="spinbutton"
          aria-label="Seconds"
          [class]="fieldClass()"
          [disabled]="disabled()"
          [value]="pad(second())"
          [attr.aria-valuenow]="second()"
          (focus)="$any($event.target).select()"
          (input)="onField('second', $event)"
          (keydown)="onKeydown('second', $event)"
        />
      }

      @if (showMillis()) {
        <span class="text-foreground-muted text-sm">.</span>
        <input
          type="text"
          inputmode="numeric"
          role="spinbutton"
          aria-label="Milliseconds"
          [class]="fieldClass() + ' w-10'"
          [disabled]="disabled()"
          [value]="pad(millisecond(), 3)"
          [attr.aria-valuenow]="millisecond()"
          (focus)="$any($event.target).select()"
          (input)="onField('millisecond', $event)"
          (keydown)="onKeydown('millisecond', $event)"
        />
      }

      @if (useAmPm()) {
        <button type="button" [class]="ampmClass()" [disabled]="disabled()" (click)="toggleMeridiem()">
          {{ isPm() ? 'PM' : 'AM' }}
        </button>
      }
    </div>
  `,
  host: {
    '[class]': 'computedClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTimePicker<T = Date> {
  private readonly adapter = injectXDateAdapter<T>();

  readonly class = input<ClassValue>('');

  /** The current time. Two-way bindable with `[(value)]`. */
  readonly value = model<T | null>(null);

  readonly precision = input<XuiTimePrecision>('minute');
  readonly useAmPm = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly pad = pad;

  /** A concrete working value — the bound value, or today at 00:00 when empty. */
  private readonly working = computed(() => this.value() ?? this.adapter.startOfDay(this.adapter.now()));

  protected readonly showSeconds = computed(() => this.precision() !== 'minute');
  protected readonly showMillis = computed(() => this.precision() === 'millisecond');

  protected readonly hour24 = computed(() => this.adapter.getHours(this.working()));
  protected readonly minute = computed(() => this.adapter.getMinutes(this.working()));
  protected readonly second = computed(() => this.adapter.getSeconds(this.working()));
  protected readonly millisecond = computed(() => this.adapter.getMilliseconds(this.working()));
  protected readonly isPm = computed(() => this.hour24() >= 12);

  protected readonly displayHour = computed(() => {
    const hour = this.hour24();
    if (!this.useAmPm()) {
      return hour;
    }
    const twelve = hour % 12;
    return twelve === 0 ? 12 : twelve;
  });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));
  protected readonly groupClass = computed(() =>
    xui(
      'border-border bg-surface-inset inline-flex h-(--control-height-md) items-center gap-1 rounded-lg border px-(--control-padding-sm)',
      'focus-within:border-focus transition-colors',
      this.disabled() && 'cursor-not-allowed opacity-50'
    )
  );
  protected readonly fieldClass = computed(() =>
    xui('text-foreground w-7 bg-transparent text-center text-sm tabular-nums outline-none')
  );
  protected readonly ampmClass = computed(() =>
    xui('text-foreground-muted hover:bg-surface-raised ms-1 rounded px-1.5 py-0.5 text-xs font-medium')
  );

  private readonly ranges: Record<string, number> = { hour: 24, minute: 60, second: 60, millisecond: 1000 };

  protected onField(unit: 'hour' | 'minute' | 'second' | 'millisecond', event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (raw === '') {
      return;
    }

    let parsed = parseInt(raw, 10);
    if (unit === 'hour') {
      parsed = this.to24Hour(parsed);
    }
    this.commit(unit, this.wrap(parsed, this.ranges[unit]));
  }

  protected onKeydown(unit: 'hour' | 'minute' | 'second' | 'millisecond', event: KeyboardEvent): void {
    const step = event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0;
    if (!step) {
      return;
    }

    event.preventDefault();
    const currentByUnit = {
      hour: this.hour24(),
      minute: this.minute(),
      second: this.second(),
      millisecond: this.millisecond()
    };
    this.commit(unit, this.wrap(currentByUnit[unit] + step, this.ranges[unit]));
  }

  protected toggleMeridiem(): void {
    this.commit('hour', this.wrap(this.hour24() + 12, 24));
  }

  /** Convert a typed 12-hour value into 24-hour, preserving the current meridiem. */
  private to24Hour(hour: number): number {
    if (!this.useAmPm()) {
      return hour;
    }

    const twelve = hour % 12;
    return this.isPm() ? twelve + 12 : twelve;
  }

  private wrap(value: number, size: number): number {
    return ((value % size) + size) % size;
  }

  private commit(unit: 'hour' | 'minute' | 'second' | 'millisecond', value: number): void {
    const next = this.adapter.set(this.working(), { [unit]: value });
    this.value.set(next);
  }
}
