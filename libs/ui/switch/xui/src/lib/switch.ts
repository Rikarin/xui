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
import { ControlValueAccessor } from '@angular/forms';
import { xui } from '@xui/core';
import { injectUniqueId } from '@xui/core/a11y';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiSwitchConfig, type XuiSwitchSize } from './switch.token';

export const switchTrackVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border-strong',
  {
    variants: {
      size: {
        md: 'h-5 w-9',
        lg: 'h-6 w-11'
      }
    },
    defaultVariants: { size: 'md' }
  }
);

export const switchThumbVariants = cva(
  // The thumb rides on emphasis-strength fills (the primary track when checked),
  // so it uses the on-emphasis foreground — white in both built-in themes, and it
  // follows an application that re-tunes the token, unlike a raw `bg-white`.
  'pointer-events-none block rounded-full bg-foreground-on-emphasis shadow-elevation-1 transition-transform data-[state=unchecked]:translate-x-0.5',
  {
    variants: {
      // The checked offset has to land the thumb the same distance from the trailing edge as the
      // unchecked one leaves at the leading edge, or the thumb looks off-centre once flipped. Its
      // resting inset is 3px — the track's 1px border plus the 0.5 nudge above — so the travel is
      // `width - 2 * 3px - thumb`, and the offset is that plus the nudge it starts from.
      size: {
        // 36 - 6 - 16 = 14px of travel, from 2px → 16px.
        md: 'size-4 data-[state=checked]:translate-x-4',
        // 44 - 6 - 20 = 18px of travel, from 2px → 20px.
        lg: 'size-5 data-[state=checked]:translate-x-5'
      }
    },
    defaultVariants: { size: 'md' }
  }
);

export type XuiSwitchVariants = VariantProps<typeof switchTrackVariants>;

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
  encapsulation: ViewEncapsulation.None,
  providers: [provideXValueAccessor(() => XuiSwitch)],
  template: `<span [class]="thumbClass()" [attr.data-state]="dataState()"></span>`,
  host: {
    role: 'switch',
    '[attr.id]': 'id()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '[attr.data-state]': 'dataState()',
    '[attr.data-disabled]': "isDisabled() ? '' : null",
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.tabindex]': 'isDisabled() ? -1 : 0',
    '[class]': 'trackClass()',
    '(click)': 'toggle()',
    '(keydown.space)': 'onKey($event)',
    '(keydown.enter)': 'onKey($event)',
    '(blur)': 'cva.markTouched()'
  }
})
export class XuiSwitch implements ControlValueAccessor {
  private readonly config = injectXuiSwitchConfig();

  /** The user-defined classes on the track. Merged last so they win. */
  readonly class = input<ClassValue>('');
  /** Track and thumb size, from the shared control scale. */
  readonly size = input<XuiSwitchSize>(this.config.size);

  /** The switch's DOM id, so a `<label for>` can point at it. Defaults to a generated unique id. */
  readonly id = input<string | null>(injectUniqueId('xui-switch'));
  /** Accessible name for the switch — what it turns on. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Id of an element naming the switch. Use it instead of `aria-label` when that text is already on screen. */
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  /** Checked state. Works two-way and via `ngModel`/`formControl`. */
  readonly checked = model(false);

  /** Block interaction and dim the switch. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<boolean>({
    onWrite: value => this.checked.set(!!value),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  protected readonly dataState = computed(() => (this.checked() ? 'checked' : 'unchecked'));
  protected readonly trackClass = computed(() => xui(switchTrackVariants({ size: this.size() }), this.class()));
  protected readonly thumbClass = computed(() => switchThumbVariants({ size: this.size() }));

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }

    const next = !this.checked();
    this.checked.set(next);
    this.cva.notifyChange(next);
  }

  protected onKey(event: Event): void {
    // The host is a custom element, not a real button, so the browser will not
    // synthesise a click from Space/Enter — toggle explicitly and swallow the key.
    event.preventDefault();
    this.toggle();
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
