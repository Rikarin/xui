import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input
} from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { XUI_RADIO_BUTTON_TOKEN, XUI_RADIO_GROUP, type XuiRadioButtonRef } from './radio-group';
import { injectXuiRadioConfig } from './radio.token';

const radioVariants = cva(
  'relative grid shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-5 focus-visible:outline-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[state=checked]:border-primary data-[state=unchecked]:border-border-strong data-[state=unchecked]:bg-surface-inset',
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
  template: `
    <span
      class="bg-primary size-1/2 rounded-full transition-transform data-[state=unchecked]:scale-0"
      [attr.data-state]="dataState()"
    ></span>
  `,
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
  readonly size = input<XuiRadioVariants['size']>(this.config.size);

  readonly value = input.required<T>();
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
