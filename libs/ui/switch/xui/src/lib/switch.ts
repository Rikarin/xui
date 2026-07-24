import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiSwitchConfig, type XuiSwitchSize } from './switch.token';

const trackVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-5 focus-visible:outline-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border-strong',
  {
    variants: {
      size: {
        default: 'h-5 w-9',
        large: 'h-6 w-11'
      }
    },
    defaultVariants: { size: 'default' }
  }
);

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-sm transition-transform data-[state=unchecked]:translate-x-0.5',
  {
    variants: {
      size: {
        default: 'size-4 data-[state=checked]:translate-x-[1.125rem]',
        large: 'size-5 data-[state=checked]:translate-x-[1.375rem]'
      }
    },
    defaultVariants: { size: 'default' }
  }
);

export type XuiSwitchVariants = VariantProps<typeof trackVariants>;

export const XUI_SWITCH_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiSwitch),
  multi: true
};

/**
 * A toggle for an immediate on/off setting — a live preference, not a value you
 * submit with a form (that is a checkbox's job).
 *
 * ```html
 * <xui-switch [(ngModel)]="notifications" />
 * <label><xui-switch [(checked)]="wifi" /> Wi-Fi</label>
 * ```
 *
 * The host is a real `role="switch"` button, so Space/Enter toggle it and its
 * state is announced. `checked` works two-way, and it is a full
 * `ControlValueAccessor`, so `ngModel`/`formControl` bind to it directly.
 */
@Component({
  selector: 'xui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="thumbClass()" [attr.data-state]="dataState()"></span>`,
  host: {
    role: 'switch',
    '[attr.id]': 'id()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '[attr.data-state]': 'dataState()',
    '[attr.data-disabled]': "disabledState() ? '' : null",
    '[attr.aria-disabled]': 'disabledState() || null',
    '[attr.tabindex]': 'disabledState() ? -1 : 0',
    '[class]': 'trackClass()',
    '(click)': 'toggle()',
    '(keydown.space)': 'onKey($event)',
    '(keydown.enter)': 'onKey($event)',
    '(blur)': 'onTouched?.()'
  }
})
export class XuiSwitch implements ControlValueAccessor {
  private readonly config = injectXuiSwitchConfig();

  /** The user-defined classes on the track. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiSwitchSize>(this.config.size);

  readonly id = input<string | null>(uniqueId('xui-switch'));
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  /** Checked state. Works two-way and via `ngModel`/`formControl`. */
  readonly checked = model(false);

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  // Disabled comes from two independent sources — the input and a reactive form's
  // setDisabledState — so OR them rather than let one clobber the other.
  private readonly disabledByForm = signal(false);
  protected readonly disabledState = computed(() => this.disabled() || this.disabledByForm());

  protected readonly dataState = computed(() => (this.checked() ? 'checked' : 'unchecked'));
  protected readonly trackClass = computed(() => xui(trackVariants({ size: this.size() }), this.class()));
  protected readonly thumbClass = computed(() => thumbVariants({ size: this.size() }));

  private onChange?: ChangeFn<boolean>;
  protected onTouched?: TouchFn;

  protected toggle(): void {
    if (this.disabledState()) {
      return;
    }

    const next = !this.checked();
    this.checked.set(next);
    this.onChange?.(next);
  }

  protected onKey(event: Event): void {
    // The host is a custom element, not a real button, so the browser will not
    // synthesise a click from Space/Enter — toggle explicitly and swallow the key.
    event.preventDefault();
    this.toggle();
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
