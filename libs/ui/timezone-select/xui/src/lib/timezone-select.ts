import { ChangeDetectionStrategy, Component, computed, input, model, ViewEncapsulation } from '@angular/core';
import { XuiSelectImports } from '@xui/select';

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
      [class]="class()"
      [items]="entries()"
      [itemText]="itemText"
      [selectedItem]="selectedEntry()"
      (selectionChange)="onSelect($event)"
      [placeholder]="placeholder()"
      [aria-label]="ariaLabel()"
      [disabled]="disabled()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiTimezoneSelect {
  readonly class = input('');
  readonly placeholder = input('Select a time zone…');
  /** Names the combobox; the placeholder is only shown until something is picked. */
  readonly ariaLabel = input<string>('Time zone', { alias: 'aria-label' });
  readonly disabled = input(false);

  /** Reference instant used to compute offsets (defaults to "now" at first render). */
  readonly date = input<Date>(new Date(0));

  /** The selected IANA time-zone id. Two-way bindable with `[(value)]`. */
  readonly value = model<string | null>(null);

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

  protected onSelect(entry: TimeZoneEntry): void {
    this.value.set(entry.id);
  }
}
