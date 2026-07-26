import type { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ViewEncapsulation
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { xui } from '@xui/core';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiSelectImports } from '@xui/select';
import type { ClassValue } from 'clsx';

interface TimeZoneEntry {
  id: string;
  label: string;
}

/** All IANA time zones the runtime knows about, or a small fallback. */
const supportedTimeZones = (): string[] => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  if (typeof intl.supportedValuesOf === 'function') {
    return intl.supportedValuesOf('timeZone');
  }
  return ['UTC', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];
};

/** The short GMT offset for a zone at the given instant, e.g. `GMT+2`. */
const offsetLabel = (zone: string, at: Date): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(at);
    return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
};

/**
 * A searchable time-zone picker: the runtime's IANA zones (via
 * `Intl.supportedValuesOf('timeZone')`) fed into `xui-select`, each labelled with
 * its current GMT offset. `[(value)]` holds the selected IANA id (a string).
 */
@Component({
  selector: 'xui-timezone-select',
  imports: [XuiSelectImports],
  template: `
    <xui-select
      class="w-full"
      [items]="entries()"
      [itemText]="itemText"
      [value]="selectedEntry()"
      (valueChange)="onSelect($event)"
      [placeholder]="placeholder()"
      [aria-label]="ariaLabel()"
      [disabled]="isDisabled()"
    />
  `,
  host: {
    '[class]': 'computedClass()'
  },
  providers: [provideXValueAccessor(() => XuiTimezoneSelect)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTimezoneSelect implements ControlValueAccessor {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /** Text shown while no zone is chosen. */
  readonly placeholder = input('Select a time zone…');
  /** Names the combobox; the placeholder is only shown until something is picked. */
  readonly ariaLabel = input<string>('Time zone', { alias: 'aria-label' });
  /** Block interaction and dim the control. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() => xui('inline-block', this.class()));

  /** Reference instant used to compute offsets (defaults to "now" at first render). */
  readonly date = input<Date>(new Date(0));

  /** The selected IANA time-zone id. Two-way bindable with `[(value)]`, or via `formControl`/`ngModel`. */
  readonly value = model<string | null>(null);

  protected readonly cva = createXValueAccessor<string | null>({
    onWrite: value => this.value.set(value ?? null),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  private readonly at = computed(() => {
    const date = this.date();
    return date && date.getTime() !== 0 ? date : new Date();
  });

  protected readonly entries = computed<TimeZoneEntry[]>(() => {
    const at = this.at();
    return supportedTimeZones().map(id => {
      const offset = offsetLabel(id, at);
      return { id, label: offset ? `${id} (${offset})` : id };
    });
  });

  protected readonly selectedEntry = computed(() => this.entries().find(e => e.id === this.value()) ?? null);

  protected readonly itemText = (entry: TimeZoneEntry): string => entry.label;

  protected onSelect(entry: TimeZoneEntry | null): void {
    const id = entry?.id ?? null;
    this.value.set(id);
    this.cva.notifyChange(id);
    // Choosing a zone closes the inner select's panel, so this is the close/blur moment.
    this.cva.markTouched();
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
