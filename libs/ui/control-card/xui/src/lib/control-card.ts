import { BooleanInput } from '@angular/cdk/coercion';
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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

/** Which control the card presents — governs the indicator and the ARIA role. */
export type XuiControlCardType = 'checkbox' | 'radio' | 'switch';

export const controlCardVariants = cva(
  [
    'flex items-center gap-3 rounded-lg border bg-surface-raised px-4 py-3 text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50'
  ],
  {
    variants: {
      selected: {
        true: 'border-primary bg-primary/5',
        false: 'border-border hover:border-border-strong cursor-pointer'
      }
    },
    defaultVariants: { selected: false }
  }
);

export type XuiControlCardVariants = VariantProps<typeof controlCardVariants>;

/**
 * A selectable card wrapping a label and a control indicator. The card itself is
 * the interactive control — click or press Space/Enter to toggle — so there is no
 * nested interactive element. `type` chooses the checkbox/radio/switch look and
 * the matching ARIA role.
 */
@Component({
  selector: 'xui-control-card',
  imports: [NgIcon, XuiIcon],
  template: `
    <span aria-hidden="true" [class]="indicatorClass()">
      @switch (type()) {
        @case ('switch') {
          <span [class]="knobClass()"></span>
        }
        @case ('radio') {
          @if (checked()) {
            <span class="bg-primary-foreground size-2 rounded-full"></span>
          }
        }
        @default {
          @if (checked()) {
            <ng-icon xui size="xs" name="matCheckRound" />
          }
        }
      }
    </span>

    <span class="flex-1"><ng-content /></span>
  `,
  host: {
    '[class]': 'computedClass()',
    '[attr.role]': 'role()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.tabindex]': 'isDisabled() ? -1 : 0',
    '(click)': 'toggle()',
    '(keydown)': 'onKeydown($event)'
  },
  providers: [provideXValueAccessor(() => XuiControlCard)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  viewProviders: [provideIcons({ matCheckRound })]
})
export class XuiControlCard implements ControlValueAccessor {
  /** Extra classes, merged into the component's own rather than replacing them. */
  readonly class = input<ClassValue>('');
  /**
   * Which control the card wraps — a checkbox, a radio or a switch. Picks both the rendered control and the selection
   * semantics.
   */
  readonly type = input<XuiControlCardType>('checkbox');

  /** The checked/selected state. Two-way bindable with `[(checked)]`. */
  readonly checked = model(false);

  /** Block interaction and dim the card, including the control inside it. */
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Whether a checked card shows the selected (accented) appearance. */
  readonly showAsSelectedWhenChecked = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<boolean>({
    onWrite: value => this.checked.set(!!value),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  protected readonly role = computed(() => (this.type() === 'switch' ? 'switch' : this.type()));

  protected readonly computedClass = computed(() =>
    xui(controlCardVariants({ selected: this.checked() && this.showAsSelectedWhenChecked() }), this.class())
  );

  protected readonly indicatorClass = computed(() => {
    const on = this.checked();
    if (this.type() === 'switch') {
      return xui(
        'flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 transition-colors',
        on ? 'bg-primary border-primary justify-end' : 'bg-surface-inset border-border-strong justify-start'
      );
    }

    return xui(
      'flex size-4 shrink-0 items-center justify-center border transition-colors',
      this.type() === 'radio' ? 'rounded-full' : 'rounded-sm',
      on ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface-inset border-border-strong'
    );
  });

  protected readonly knobClass = computed(() =>
    xui('size-4 rounded-full bg-primary-foreground shadow transition-transform')
  );

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }

    // Radios only ever turn on by selection; the others flip.
    const next = this.type() === 'radio' ? true : !this.checked();
    if (next === this.checked()) {
      return;
    }

    this.checked.set(next);
    this.cva.notifyChange(next);
    this.cva.markTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  // --- ControlValueAccessor ---
  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
