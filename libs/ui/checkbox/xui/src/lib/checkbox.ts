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
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matCheckRound, matRemoveRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { XCheckbox, XCheckboxImports } from '@xui/core/checkbox';
import type { XChangeFn, XTouchFn } from '@xui/core/forms';
import { XuiIcon, XuiIconSize } from '@xui/icon';
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

export type XuiCheckboxVariants = VariantProps<typeof checkboxVariants> & { size: XuiIconSize };

/** The `<label>` that wraps the box and its text, governing layout. */
const checkboxWrapperVariants = cva('items-center gap-x-2 data-disabled:cursor-not-allowed', {
  variants: {
    inline: {
      // Non-inline controls take a full row so several stack vertically; inline
      // ones sit side by side with a little breathing room to their right.
      false: 'flex',
      true: 'me-5 inline-flex align-middle'
    },
    alignIndicator: {
      // `end` flips the box to the trailing edge, label leading.
      start: 'flex-row',
      end: 'flex-row-reverse justify-between'
    },
    disabled: {
      true: 'cursor-not-allowed text-foreground-subtle',
      false: 'cursor-pointer'
    }
  },
  defaultVariants: { inline: false, alignIndicator: 'start', disabled: false }
});
type WrapperVariants = VariantProps<typeof checkboxWrapperVariants>;

export type XuiCheckboxAlignIndicator = NonNullable<WrapperVariants['alignIndicator']>;

export const XUI_CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiCheckbox),
  multi: true
};

@Component({
  selector: 'xui-checkbox',
  imports: [XCheckboxImports, NgIcon, XuiIcon],
  template: `
    <span [class]="wrapperClass()">
      <x-checkbox
        [id]="id()"
        [name]="name()"
        [class]="computedClass()"
        [checked]="checked()"
        [(indeterminate)]="indeterminate"
        [disabled]="_disabled()"
        [required]="required()"
        [aria-label]="effectiveAriaLabel()"
        [aria-labelledby]="effectiveAriaLabelledby()"
        [aria-describedby]="ariaDescribedby()"
        (checkedChange)="handleChange($event)"
        (touched)="onTouched?.()"
      >
        <ng-icon
          xui
          [size]="iconSize()"
          [name]="indeterminate() ? 'matRemoveRound' : 'matCheckRound'"
          [class]="computedIconClass()"
        />
      </x-checkbox>
      <!-- The box is a custom control, not a labelable element, so a wrapping
           <label> would not forward clicks — toggle the box explicitly instead.
           Keyboard users operate the focusable box directly, so the label text is
           deliberately not a second tab stop. -->
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <span [id]="labelId" [class]="labelClass()" (click)="toggleFromLabel()">
        @if (label()) {
          <span>{{ label() }}</span>
        }
        <ng-content
      /></span>
    </span>
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
  readonly color = input<XuiCheckboxVariants['color']>(this.config.color);
  readonly size = input<XuiCheckboxVariants['size']>(this.config.size);

  /** A plain-text label rendered beside the box, as an alternative to projection. */
  readonly label = input<string>('');

  /** Which side the box sits on relative to the label. */
  readonly alignIndicator = input<XuiCheckboxAlignIndicator>('start');

  /** Lay the control out inline so several sit on one line, rather than stacked. */
  readonly inline = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** Render a larger box and label. */
  readonly large = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  /** The box grows a step when `large`; otherwise follows the configured size. */
  protected readonly iconSize = computed<XuiIconSize>(() => (this.large() ? 'lg' : this.size()));

  protected readonly computedClass = computed(() =>
    xui(checkboxVariants({ color: this.color() }), this.large() && 'p-0.5', this.class())
  );
  protected readonly computedIconClass = computed(() => xui('leading-none group-data-[state=unchecked]:opacity-0'));

  protected readonly wrapperClass = computed(() =>
    xui(
      checkboxWrapperVariants({
        inline: this.inline(),
        alignIndicator: this.alignIndicator(),
        disabled: this._disabled()
      })
    )
  );

  protected readonly labelClass = computed(() =>
    xui('select-none empty:hidden', this.large() ? 'text-base' : 'text-sm')
  );

  /** Fall back to the plain-text label for the box's accessible name. */
  protected readonly effectiveAriaLabel = computed(() => this.ariaLabel() ?? (this.label() || null));

  protected readonly labelId = uniqueId('xui-checkbox-label');

  /**
   * Projected label content lives in a sibling span, not inside the button, so
   * it cannot name the control on its own. Point the box at that span whenever
   * there is no `label` string or explicit `aria-label`/`aria-labelledby` — the
   * common `<xui-checkbox>Rich <b>content</b></xui-checkbox>` form would
   * otherwise render a checkbox with no accessible name at all.
   */
  protected readonly effectiveAriaLabelledby = computed(
    () => this.ariaLabelledby() ?? (this.effectiveAriaLabel() ? null : this.labelId)
  );

  private readonly box = viewChild(XCheckbox);

  /** The label text is not a real `<label>`, so forward its clicks to the box. */
  protected toggleFromLabel(): void {
    this.box()?.toggle();
  }

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

  protected onChange?: XChangeFn<boolean>;
  protected onTouched?: XTouchFn;

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

  registerOnChange(fn: XChangeFn<boolean>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: XTouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
