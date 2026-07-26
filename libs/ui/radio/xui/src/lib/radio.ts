import type { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XUI_RADIO_BUTTON_TOKEN, XUI_RADIO_GROUP, type XuiRadioButtonRef } from './radio-group';
import { injectXuiRadioConfig } from './radio.token';

export const radioVariants = cva(
  'relative grid shrink-0 place-items-center rounded-full border transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[state=checked]:border-primary data-[state=unchecked]:border-border-strong data-[state=unchecked]:bg-surface-inset',
  {
    variants: {
      size: {
        md: 'size-5',
        sm: 'size-4'
      }
    },
    defaultVariants: { size: 'md' }
  }
);

export type XuiRadioVariants = VariantProps<typeof radioVariants>;

/**
 * One option within a `xui-radio-group`.
 *
 * ```html
 * <label class="flex items-center gap-2"><xui-radio value="pro" /> Pro</label>
 * ```
 *
 * A real `role="radio"` button that reports its checked state and takes its
 * name, selection and single tab stop from the enclosing group — it holds no
 * value of its own beyond `value`, so the group stays the one source of truth.
 * Selecting is a click or Space/Enter; arrow-key movement is the group's job.
 */
@Component({
  selector: 'xui-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: ` <span [class]="dotClass()" [attr.data-state]="dataState()"></span> `,
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'dataState()',
    '[attr.data-disabled]': "isDisabled() ? '' : null",
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.tabindex]': 'tabIndex()',
    '[class]': 'computedClass()',
    '(click)': 'select()',
    '(keydown.space)': 'onKey($event)',
    '(keydown.enter)': 'onKey($event)'
  },
  providers: [{ provide: XUI_RADIO_BUTTON_TOKEN, useExisting: XuiRadio }]
})
export class XuiRadio<T = unknown> implements XuiRadioButtonRef {
  private readonly group = inject(XUI_RADIO_GROUP);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly config = injectXuiRadioConfig();

  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  /** Button size, from the shared control scale. */
  readonly size = input<XuiRadioVariants['size']>(this.config.size);

  /** What the group's value becomes when this radio is chosen. Must be unique within the group. */
  readonly value = input.required<T>();
  /** Disable this radio alone. A radio in a disabled group is disabled regardless. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly checked = computed(() => this.group.value() === this.value());
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());

  focus(): void {
    this.host.focus();
  }
  protected readonly dataState = computed(() => (this.checked() ? 'checked' : 'unchecked'));

  // The selected radio holds the tab stop; before any selection, the first
  // enabled one does, so Tab always reaches the group.
  protected readonly tabIndex = computed(() => {
    if (this.isDisabled()) {
      return -1;
    }

    return this.checked() || this.group.isFirstEnabled(this.value()) ? 0 : -1;
  });

  protected readonly computedClass = computed(() => xui(radioVariants({ size: this.size() }), this.class()));

  /**
   * A percentage here resolves against the content box, so `1/2` of a 20px control came out at 9px
   * — an odd size centred at a half-pixel, which rasterises the circle lopsided however exactly the
   * grid centres it. Pin it to an even size so both the dot and the ring around it stay on whole
   * pixels: half the control, measured the way the eye reads it.
   */
  protected readonly dotClass = computed(() =>
    xui(
      'bg-primary rounded-full transition-transform data-[state=unchecked]:scale-0',
      this.size() === 'sm' ? 'size-2' : 'size-2.5'
    )
  );

  protected select(): void {
    if (this.isDisabled()) {
      return;
    }

    this.group.select(this.value());
  }

  protected onKey(event: Event): void {
    event.preventDefault();
    this.select();
  }
}
