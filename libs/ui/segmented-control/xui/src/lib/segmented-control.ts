import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  model,
  viewChildren
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { xui } from '@xui/core';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const segmentedControlContainerVariants = cva(
  'bg-surface-inset border-border inline-flex gap-0.5 rounded-lg border p-0.5',
  {
    variants: {
      size: { md: 'text-sm', sm: 'text-xs' },
      fill: { true: 'flex w-full', false: '' }
    },
    defaultVariants: { size: 'md', fill: false }
  }
);

export type XuiSegmentedControlVariants = VariantProps<typeof segmentedControlContainerVariants>;

/** One choice in a segmented control. */
export interface XuiSegmentedOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * A single-choice control laid out as a row of segments — a compact toggle
 * between a few mutually exclusive options.
 *
 * ```html
 * <xui-segmented-control [(value)]="view" [options]="[{value:'list',label:'List'},{value:'grid',label:'Grid'}]" />
 * ```
 *
 * `role="radiogroup"` with one tab stop; arrow keys move between segments per
 * the WAI-ARIA radio pattern. It is a `ControlValueAccessor`, so forms bind to
 * it directly — a sibling of `@xui/radio` with a different skin, for when the
 * options are few enough to show at once.
 */
@Component({
  selector: 'xui-segmented-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideXValueAccessor(() => XuiSegmentedControl)],
  template: `
    @for (option of options(); track option.value; let i = $index) {
      <button
        #segment
        type="button"
        role="radio"
        [attr.aria-checked]="option.value === value()"
        [attr.tabindex]="tabIndex(option, i)"
        [disabled]="option.disabled || isDisabled()"
        [class]="segmentClass(option.value === value())"
        (click)="select(option.value)"
        (keydown.arrowright)="move($event, 1)"
        (keydown.arrowdown)="move($event, 1)"
        (keydown.arrowleft)="move($event, -1)"
        (keydown.arrowup)="move($event, -1)"
        (blur)="cva.markTouched()"
      >
        {{ option.label }}
      </button>
    }
  `,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'computedClass()'
  }
})
export class XuiSegmentedControl<T = string> implements ControlValueAccessor {
  private readonly segments = viewChildren<ElementRef<HTMLButtonElement>>('segment');

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiSegmentedControlVariants['size']>('md');
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  readonly options = input<readonly XuiSegmentedOption<T>[]>([]);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** The chosen value. Two-way, and via `ngModel`/`formControl`. */
  readonly value = model<T | null>(null);

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<T | null>({
    onWrite: value => this.value.set(value),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  protected readonly computedClass = computed(() =>
    xui(segmentedControlContainerVariants({ size: this.size(), fill: this.fill() }), this.class())
  );

  protected segmentClass(selected: boolean): string {
    return xui(
      'inline-flex h-(--control-height-sm) items-center justify-center rounded-md px-(--control-padding-md) font-medium transition-colors focus-visible:outline-5 focus-visible:outline-offset-1 disabled:pointer-events-none disabled:opacity-40',
      this.fill() && 'flex-1',
      selected ? 'bg-surface-raised text-foreground shadow-elevation-1' : 'text-foreground-muted hover:text-foreground'
    );
  }

  /** The selected segment holds the tab stop; before any choice, the first enabled one does. */
  protected tabIndex(option: XuiSegmentedOption<T>, index: number): number {
    if (option.disabled || this.isDisabled()) {
      return -1;
    }

    if (this.value() != null) {
      return option.value === this.value() ? 0 : -1;
    }

    return index === this.options().findIndex(o => !o.disabled) ? 0 : -1;
  }

  protected select(value: T): void {
    const option = this.options().find(o => o.value === value);

    // Guard the option's own disabled state too, not just the group's — a
    // disabled <button> blocks native clicks, but nothing stops a programmatic one.
    if (this.isDisabled() || option?.disabled) {
      return;
    }

    this.value.set(value);
    this.cva.notifyChange(value);
    this.cva.markTouched();
  }

  protected move(event: Event, delta: 1 | -1): void {
    event.preventDefault();

    const options = this.options();
    const enabled = options.filter(option => !option.disabled);

    if (this.isDisabled() || !enabled.length) {
      return;
    }

    const current = enabled.findIndex(option => option.value === this.value());
    const next = enabled[(current + delta + enabled.length) % enabled.length];

    this.select(next.value);
    this.segments()[options.indexOf(next)]?.nativeElement.focus();
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
