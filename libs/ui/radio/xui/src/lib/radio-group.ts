import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  input,
  model
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import type { ClassValue } from 'clsx';
import { injectXuiRadioConfig } from './radio.token';

/** The contract a group exposes to its buttons — kept narrow to avoid a cycle. */
export interface XuiRadioGroupContract<T = unknown> {
  readonly value: () => T | null;
  readonly name: () => string;
  /** Whether the group is disabled — by its input or by a reactive form. */
  readonly isDisabled: () => boolean;
  select(value: T): void;
  isFirstEnabled(value: T): boolean;
}

/** What a group needs from each button, without importing the button class. */
export interface XuiRadioButtonRef {
  value(): unknown;
  isDisabled(): boolean;
  focus(): void;
}

export const XUI_RADIO_GROUP = new InjectionToken<XuiRadioGroupContract>('XuiRadioGroup');

/** Token the group uses to collect its buttons. */
export const XUI_RADIO_BUTTON_TOKEN = new InjectionToken<XuiRadioButtonRef>('XuiRadioButton');

/**
 * A single-choice group of radios.
 *
 * ```html
 * <xui-radio-group [(ngModel)]="plan" ariaLabel="Plan">
 *   <label><xui-radio value="free" /> Free</label>
 *   <label><xui-radio value="pro" /> Pro</label>
 * </xui-radio-group>
 * ```
 *
 * The group owns the value and the a11y contract: `role="radiogroup"`, one
 * shared `name`, and a single tab stop (arrow keys move between options, per the
 * WAI-ARIA radio pattern). It is a `ControlValueAccessor`, so forms bind to the
 * group, never to individual radios.
 */
@Component({
  selector: 'xui-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '[class]': 'computedClass()',
    '(keydown.arrowdown)': 'move($event, 1)',
    '(keydown.arrowright)': 'move($event, 1)',
    '(keydown.arrowup)': 'move($event, -1)',
    '(keydown.arrowleft)': 'move($event, -1)'
  },
  providers: [
    provideXValueAccessor(() => XuiRadioGroup),
    { provide: XUI_RADIO_GROUP, useExisting: forwardRef(() => XuiRadioGroup) }
  ]
})
export class XuiRadioGroup<T = unknown> implements ControlValueAccessor, XuiRadioGroupContract<T> {
  // `descendants: true` because radios are usually wrapped in a `<label>`, so
  // they are not direct content children of the group.
  private readonly buttons = contentChildren(XUI_RADIO_BUTTON_TOKEN, { descendants: true });
  private readonly config = injectXuiRadioConfig();

  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');
  /** Layout of the options. */
  readonly orientation = input<'vertical' | 'horizontal'>(this.config.orientation);

  readonly name = input<string>(uniqueId('xui-radio-group'));
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  /** The chosen value. Works two-way and via `ngModel`/`formControl`. */
  readonly value = model<T | null>(null);

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<T | null>({
    onWrite: value => this.value.set(value),
    disabled: this.disabled
  });
  /** Public rather than protected: the buttons read it through the contract. */
  readonly isDisabled = this.cva.disabled;

  protected readonly computedClass = computed(() =>
    xui('flex gap-2', this.orientation() === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', this.class())
  );

  select(value: T): void {
    if (this.isDisabled()) {
      return;
    }

    this.value.set(value);
    this.cva.notifyChange(value);
    this.cva.markTouched();
  }

  /**
   * Which option holds the single tab stop: the selected one, or — when nothing
   * is selected yet — the first enabled option, so Tab always lands somewhere.
   */
  isFirstEnabled(value: T): boolean {
    if (this.value() != null) {
      return false;
    }

    const first = this.buttons().find(button => !button.isDisabled());

    return first?.value() === value;
  }

  /**
   * Arrow-key movement across the enabled options, wrapping at the ends. Per the
   * radio pattern, moving also selects — and focus follows selection.
   */
  protected move(event: Event, delta: 1 | -1): void {
    if (this.isDisabled()) {
      return;
    }

    event.preventDefault();

    const enabled = this.buttons().filter(button => !button.isDisabled());

    if (!enabled.length) {
      return;
    }

    const current = enabled.findIndex(button => button.value() === this.value());
    const next = enabled[(current + delta + enabled.length) % enabled.length];

    this.select(next.value() as T);
    next.focus();
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
