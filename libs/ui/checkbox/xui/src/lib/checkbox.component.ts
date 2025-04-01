import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matRemoveRound } from '@ng-icons/material-icons/round';

import { xui } from '@xui/core';
import { XCheckboxComponent } from '@xui/core/checkbox';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { IconSize, XuiIconDirective } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiCheckboxConfig } from './checkbox.token';

const checkboxVariants = cva(
  [
    'group inline-flex border shrink-0 cursor-pointer items-center rounded-sm',
    'focus-visible:outline-5 focus-visible:outline-offset-2 transition-[outline]',
    'border-foreground/30 data-[state=unchecked]:bg-background',
    'data-[disabled=true]:cursor-not-allowed data-[disabled=true]:saturate-30'
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
  useExisting: forwardRef(() => XuiCheckboxComponent),
  multi: true
};

@Component({
  selector: 'xui-checkbox',
  imports: [XCheckboxComponent, NgIcon, XuiIconDirective],
  template: `
    <x-checkbox
      [id]="id()"
      [name]="name()"
      [class]="computedClass()"
      [checked]="checked()"
      [disabled]="state().disabled()"
      [required]="required()"
      [aria-label]="ariaLabel()"
      [aria-labelledby]="ariaLabelledby()"
      [aria-describedby]="ariaDescribedby()"
      (changed)="handleChange()"
      (touched)="onTouched?.()"
    >
      <ng-icon
        xui
        [size]="size()"
        [name]="checked() === 'indeterminate' ? 'matRemoveRound' : 'matCheckRound'"
        [class]="computedIconClass()"
      />
    </x-checkbox>
  `,
  host: {
    class: 'contents',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null'
  },
  providers: [XUI_CHECKBOX_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCheckRound, matRemoveRound })]
})
export class XuiCheckboxComponent {
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
  readonly checked = model<CheckboxValue>(false);

  /** The name attribute of the checkbox. */
  readonly name = input<string | null>(null);

  /** Whether the checkbox is required. */
  readonly required = input(false, { transform: booleanAttribute });

  /** Whether the checkbox is disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly state = computed(() => ({
    disabled: signal(this.disabled())
  }));

  readonly changed = output<boolean>();

  protected onChange?: ChangeFn<CheckboxValue>;
  protected onTouched?: TouchFn;

  protected handleChange(): void {
    if (this.state().disabled()) {
      return;
    }

    const previousChecked = this.checked();
    this.checked.set(previousChecked === 'indeterminate' ? true : !previousChecked);
    this.onChange?.(!previousChecked);
    this.changed.emit(!previousChecked);
  }

  /** CONTROL VALUE ACCESSOR */
  writeValue(value: CheckboxValue): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: ChangeFn<CheckboxValue>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().disabled.set(isDisabled);
  }
}

type CheckboxValue = boolean | 'indeterminate';
