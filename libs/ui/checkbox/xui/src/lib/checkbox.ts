import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  linkedSignal,
  model,
  output,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matRemoveRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { XCheckboxImports } from '@xui/core/checkbox';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { IconSize, XuiIcon } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiCheckboxConfig } from './checkbox.token';

const checkboxVariants = cva(
  [
    'group inline-flex border shrink-0 cursor-pointer items-center rounded-sm',
    'focus-visible:outline-5 focus-visible:outline-offset-2 transition-[outline]',
    'border-border-strong data-[state=unchecked]:bg-surface-inset',
    'data-disabled:cursor-not-allowed data-disabled:saturate-30'
  ],
  {
    variants: {
      color: {
        primary:
          '[&:not([data-state=unchecked])]:text-primary-foreground [&:not([data-state=unchecked])]:bg-primary [&:not([data-state=unchecked])]:border-primary-darker',
        secondary:
          '[&:not([data-state=unchecked])]:text-secondary-foreground [&:not([data-state=unchecked])]:bg-secondary [&:not([data-state=unchecked])]:border-secondary-darker',
        success:
          '[&:not([data-state=unchecked])]:text-success-foreground [&:not([data-state=unchecked])]:bg-success [&:not([data-state=unchecked])]:border-success-darker',
        error:
          '[&:not([data-state=unchecked])]:text-error-foreground [&:not([data-state=unchecked])]:bg-error [&:not([data-state=unchecked])]:border-error-darker',
        info: '[&:not([data-state=unchecked])]:text-info-foreground [&:not([data-state=unchecked])]:bg-info [&:not([data-state=unchecked])]:border-info-darker',
        warning:
          '[&:not([data-state=unchecked])]:text-warning-foreground [&:not([data-state=unchecked])]:bg-warning [&:not([data-state=unchecked])]:border-warning-darker'
      }
    },
    defaultVariants: {
      color: 'primary'
    }
  }
);

export type CheckboxVariants = VariantProps<typeof checkboxVariants> & { size: IconSize };

export const XUI_CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiCheckbox),
  multi: true
};

@Component({
  selector: 'xui-checkbox',
  imports: [XCheckboxImports, NgIcon, XuiIcon],
  template: `
    <x-checkbox
      [id]="id()"
      [name]="name()"
      [class]="computedClass()"
      [checked]="checked()"
      [(indeterminate)]="indeterminate"
      [disabled]="_disabled()"
      [required]="required()"
      [aria-label]="ariaLabel()"
      [aria-labelledby]="ariaLabelledby()"
      [aria-describedby]="ariaDescribedby()"
      (checkedChange)="handleChange($event)"
      (touched)="onTouched?.()"
    >
      <ng-icon
        xui
        [size]="size()"
        [name]="indeterminate() ? 'matRemoveRound' : 'matCheckRound'"
        [class]="computedIconClass()"
      />
    </x-checkbox>
  `,
  host: {
    class: 'contents',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.data-disabled]': '_disabled() ? "" : null'
  },
  providers: [XUI_CHECKBOX_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCheckRound, matRemoveRound })]
})
export class XuiCheckbox implements ControlValueAccessor {
  private readonly config = injectXuiCheckboxConfig();

  readonly class = input<ClassValue>('');
  readonly color = input<CheckboxVariants['color']>(this.config.color);
  readonly size = input<CheckboxVariants['size']>(this.config.size);

  protected readonly computedClass = computed(() => xui(checkboxVariants({ color: this.color() }), this.class()));
  protected readonly computedIconClass = computed(() => xui('leading-none group-data-[state=unchecked]:opacity-0'));

  /** Used to set the id on the underlying xLabel element. */
  readonly id = input<string | null>(null);

  /** Used to set the aria-label attribute on the underlying xLabel element. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** Used to set the aria-labelledby attribute on the underlying xLabel element. */
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  /** Used to set the aria-describedby attribute on the underlying xLabel element. */
  readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

  /** The checked state of the checkbox. */
  // Aliased so the writable `checked` linkedSignal below can own the public name.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly checkedInput = input<boolean>(false, { alias: 'checked' });
  readonly checked = linkedSignal(this.checkedInput);

  /** Emits when checked state changes. */
  readonly checkedChange = output<boolean>();

  /**
   * The indeterminate state of the checkbox.
   * For example, a "select all/deselect all" checkbox may be in the indeterminate state when some but not all of its sub-controls are checked.
   */
  readonly indeterminate = model<boolean>(false);

  /** The name attribute of the checkbox. */
  readonly name = input<string | null>(null);

  /** Whether the checkbox is required. */
  readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Whether the checkbox is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  protected readonly _disabled = linkedSignal(this.disabled);

  protected onChange?: ChangeFn<boolean>;
  protected onTouched?: TouchFn;

  protected handleChange(value: boolean): void {
    if (this._disabled()) {
      return;
    }

    this.checked.set(value);
    this.checkedChange.emit(value);
    this.onChange?.(value);
  }

  /** CONTROL VALUE ACCESSOR */
  writeValue(value: boolean): void {
    this.checked.set(value);
  }

  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
