import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

const wrapperVariants = cva(
  'border-border bg-surface-inset text-foreground focus-within:border-focus relative inline-flex items-center rounded-lg border transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50',
  {
    variants: {
      size: { default: 'h-11 text-base', sm: 'h-9 text-sm' },
      fill: { true: 'w-full', false: 'w-auto' }
    },
    defaultVariants: { size: 'default', fill: false }
  }
);

export type XuiHtmlSelectVariants = VariantProps<typeof wrapperVariants>;

/** One `<option>` when the options come as data rather than projected markup. */
export interface XuiHtmlSelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * A styled native `<select>`.
 *
 * ```html
 * <xui-html-select [(ngModel)]="sort" [options]="['Newest', 'Oldest']" />
 * <xui-html-select [(ngModel)]="env">
 *   <option value="dev">Development</option>
 * </xui-html-select>
 * ```
 *
 * The real `<select>` underneath keeps the platform's dropdown, keyboard and
 * mobile behaviour — this only frames it and adds the chevron. Give it options
 * as data, or project `<option>` elements. It is a `ControlValueAccessor`, so
 * forms bind straight to it.
 */
@Component({
  selector: 'xui-html-select',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matExpandMoreRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => XuiHtmlSelect), multi: true }],
  template: `
    <select
      #field
      [class]="selectClass()"
      [disabled]="disabledState()"
      [attr.aria-label]="ariaLabel()"
      (change)="onSelect(field.value)"
      (blur)="onTouched?.()"
    >
      @if (placeholder(); as ph) {
        <option value="" disabled [selected]="value() === null || value() === ''">{{ ph }}</option>
      }
      @for (option of options(); track option.value) {
        <option [value]="option.value" [disabled]="option.disabled" [selected]="option.value === value()">
          {{ option.label }}
        </option>
      }
      <ng-content />
    </select>

    <ng-icon
      xui
      size="sm"
      name="matExpandMoreRound"
      class="text-foreground-muted pointer-events-none absolute end-2.5"
    />
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiHtmlSelect<T = string> implements ControlValueAccessor {
  /** The user-defined classes on the wrapper. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiHtmlSelectVariants['size']>('default');
  readonly fill = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Options as data; alternatively, project `<option>` elements. */
  readonly options = input<readonly XuiHtmlSelectOption<T>[]>([]);
  /** A leading, unselectable prompt shown when nothing is chosen. */
  readonly placeholder = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  private readonly disabledByForm = signal(false);
  protected readonly disabledState = computed(() => this.disabled() || this.disabledByForm());

  protected readonly value = signal<T | string | null>(null);

  protected readonly computedClass = computed(() =>
    xui(wrapperVariants({ size: this.size(), fill: this.fill() }), this.class())
  );
  protected readonly selectClass = computed(() =>
    xui(
      'w-full cursor-pointer appearance-none bg-transparent pe-8 ps-2.5 outline-none disabled:cursor-not-allowed',
      this.size() === 'sm' ? 'h-9' : 'h-11'
    )
  );

  private onChange?: ChangeFn<T | string | null>;
  protected onTouched?: TouchFn;

  protected onSelect(value: string): void {
    // Recover the original typed option value (number, object) when the choice
    // came from the data-driven `options`, since the DOM only carries strings.
    const original = this.options().find(option => String(option.value) === value);
    const next = original ? original.value : value;

    this.value.set(next);
    this.onChange?.(next);
  }

  writeValue(value: T | string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: ChangeFn<T | string | null>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
