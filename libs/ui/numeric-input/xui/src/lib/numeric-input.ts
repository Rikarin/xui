import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  linkedSignal,
  numberAttribute,
  signal,
  type Signal
} from '@angular/core';
import { ControlValueAccessor, type NgControl } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matKeyboardArrowDownRound, matKeyboardArrowUpRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { XFormFieldControl } from '@xui/core/form-field';
import { createXErrorState, createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiIcon, type XuiIconSize } from '@xui/icon';
import type { ClassValue } from 'clsx';
import {
  injectXuiNumericInputConfig,
  type XuiNumericButtonPosition,
  type XuiNumericInputSize
} from './numeric-input.token';

/**
 * A number field with stepper buttons and keyboard increment.
 *
 * ```html
 * <xui-numeric-input [(ngModel)]="quantity" [min]="0" [max]="99" />
 * ```
 *
 * The value is a `number | null` (empty is `null`, not `0`, so "no answer" is
 * distinct from zero). ArrowUp/Down step by `stepSize`; Shift steps by
 * `majorStepSize`, Alt by `minorStepSize`. It is a `ControlValueAccessor`, so
 * forms bind to it directly, and it clamps into `[min, max]` on blur.
 */
@Component({
  selector: 'xui-numeric-input',
  imports: [NgTemplateOutlet, NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matKeyboardArrowUpRound, matKeyboardArrowDownRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    provideXValueAccessor(() => XuiNumericInput),
    {
      provide: XFormFieldControl,
      useExisting: forwardRef(() => XuiNumericInput)
    }
  ],
  template: `
    @if (buttonPosition() === 'left') {
      <ng-container [ngTemplateOutlet]="steppers" />
    }

    <input
      #field
      [id]="fieldId"
      type="text"
      inputmode="decimal"
      [class]="fieldClass()"
      [value]="display()"
      [disabled]="isDisabled()"
      [attr.placeholder]="placeholder()"
      [attr.aria-label]="ariaLabel()"
      role="spinbutton"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuemin]="min() ?? null"
      [attr.aria-valuemax]="max() ?? null"
      (input)="onInput(field.value)"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    />

    @if (buttonPosition() === 'right') {
      <ng-container [ngTemplateOutlet]="steppers" />
    }

    <ng-template #steppers>
      <div [class]="stepperColumnClass()">
        <button
          type="button"
          tabindex="-1"
          aria-label="Increment"
          [class]="stepperClass()"
          [disabled]="!canIncrement()"
          (click)="step(stepSize())"
        >
          <ng-icon xui [size]="stepperIconSize()" name="matKeyboardArrowUpRound" />
        </button>
        <button
          type="button"
          tabindex="-1"
          aria-label="Decrement"
          [class]="stepperClass()"
          [disabled]="!canDecrement()"
          (click)="step(-stepSize())"
        >
          <ng-icon xui [size]="stepperIconSize()" name="matKeyboardArrowDownRound" />
        </button>
      </div>
    </ng-template>
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiNumericInput implements ControlValueAccessor, XFormFieldControl {
  private readonly config = injectXuiNumericInputConfig();
  private readonly formState = createXErrorState();
  protected readonly fieldId = uniqueId('xui-numeric-input');

  /** Error state for `xui-form-field`, derived from the optional bound form control. */
  readonly errorState = this.formState.errorState;

  /** Points the form field's `<label for>` at the inner text field, not the host. */
  readonly controlId: Signal<string | null> = signal(this.fieldId).asReadonly();

  get ngControl(): NgControl | null {
    return this.formState.ngControl();
  }

  /** The user-defined classes on the wrapper. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiNumericInputSize>(this.config.size);
  readonly buttonPosition = input<XuiNumericButtonPosition>(this.config.buttonPosition);

  readonly placeholder = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly min = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });
  readonly max = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });
  readonly stepSize = input<number, NumberInput>(this.config.stepSize, { transform: numberAttribute });
  readonly majorStepSize = input<number, NumberInput>(this.config.majorStepSize, { transform: numberAttribute });
  readonly minorStepSize = input<number, NumberInput>(this.config.minorStepSize, { transform: numberAttribute });
  readonly clampValueOnBlur = input<boolean, BooleanInput>(this.config.clampValueOnBlur, {
    transform: booleanAttribute
  });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly cva = createXValueAccessor<number | null>({
    onWrite: value => {
      this.value.set(value ?? null);
      this.text.set(value == null ? '' : String(value));
    },
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  // Aliased so the writable `value` linkedSignal below can own the public name.
  // Coerce so `value="5"` (a string attribute) becomes the number 5, not the
  // string "5" that would then concatenate under `+ stepSize`.
  readonly valueInput = input<number | null, number | string | null | undefined>(null, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'value',
    transform: raw => (raw == null || raw === '' ? null : Number(raw))
  });
  /** The current numeric value, or `null` when empty. Two-way via `value`. */
  readonly value = linkedSignal(this.valueInput);

  // The text the field shows. Kept separate from `value` so a half-typed entry
  // ("-", "1.") is preserved while the parsed value stays null/last-valid.
  private readonly text = signal<string>('');
  protected readonly display = computed(() => {
    const value = this.value();

    // Do not overwrite what the user is mid-typing with a formatted number.
    return this.text() !== '' || value == null ? this.text() : String(value);
  });

  protected readonly canIncrement = computed(() => !this.isDisabled() && !this.atMax(this.value()));
  protected readonly canDecrement = computed(() => !this.isDisabled() && !this.atMin(this.value()));

  protected readonly computedClass = computed(() =>
    xui(
      'border-border bg-surface-inset focus-within:border-focus inline-flex items-stretch overflow-hidden rounded-lg border transition-colors',
      // The wrapper carries the control height so the stepper column cannot stretch the field
      // past the shared scale.
      this.size() === 'sm' ? 'h-(--control-height-sm)' : 'h-(--control-height-md)',
      this.isDisabled() && 'cursor-not-allowed opacity-50',
      this.class()
    )
  );
  protected readonly fieldClass = computed(() =>
    xui(
      'text-foreground placeholder:text-foreground-subtle w-full min-w-0 bg-transparent tabular-nums outline-none',
      this.size() === 'sm' ? 'px-(--control-padding-sm) text-xs' : 'px-(--control-padding-md) text-sm'
    )
  );
  protected readonly stepperColumnClass = computed(() =>
    xui(
      'border-border flex shrink-0 flex-col',
      // The rule divides the steppers from the field, so it belongs on whichever edge faces it —
      // on the outer edge it would just double up on the wrapper's own border.
      this.buttonPosition() === 'left' ? 'border-e' : 'border-s'
    )
  );

  /**
   * The two steppers split the control height between them, so a glyph sized off the icon scale
   * (`sm` is 16px) makes the column taller than the field — and the wrapper clips the overflow,
   * taking the bottom arrow with it. Size to the row instead: half of 24px or 30px, less a hair.
   */
  protected readonly stepperIconSize = computed<XuiIconSize>(() => (this.size() === 'sm' ? '10px' : '12px'));
  /**
   * A disabled stepper keeps its pointer events so the cursor can say it is unavailable — an
   * element that receives none contributes no cursor either. The native `disabled` swallows the
   * click, and `enabled:` keeps the hover lift off a stepper that cannot be pressed.
   */
  protected readonly stepperClass = computed(
    () =>
      'text-foreground-muted enabled:hover:bg-hover-overlay enabled:hover:text-foreground flex flex-1 items-center justify-center px-1.5 disabled:cursor-not-allowed disabled:opacity-40'
  );

  protected onInput(raw: string): void {
    this.text.set(raw);

    const parsed = this.parse(raw);
    this.value.set(parsed);
    this.cva.notifyChange(parsed);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    const magnitude = event.shiftKey ? this.majorStepSize() : event.altKey ? this.minorStepSize() : this.stepSize();
    this.step(event.key === 'ArrowUp' ? magnitude : -magnitude);
  }

  protected onBlur(): void {
    if (this.clampValueOnBlur()) {
      this.commit(this.clamp(this.value()));
    }

    // Re-sync the text with the committed value, dropping a half-typed entry.
    this.text.set(this.value() == null ? '' : String(this.value()));
    this.cva.markTouched();
  }

  step(delta: number): void {
    if (this.isDisabled()) {
      return;
    }

    const base = this.value() ?? 0;
    // Round to the step grid so 0.1 + 0.2 does not drift to 0.30000000000000004.
    const next = this.clamp(this.round(base + delta));
    this.commit(next);
    this.text.set(next == null ? '' : String(next));
  }

  private commit(value: number | null): void {
    this.value.set(value);
    this.cva.notifyChange(value);
  }

  private parse(raw: string): number | null {
    const trimmed = raw.trim();

    if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
      return null;
    }

    const parsed = Number(trimmed);

    return Number.isFinite(parsed) ? parsed : this.value();
  }

  private clamp(value: number | null): number | null {
    if (value == null) {
      return null;
    }

    const min = this.min();
    const max = this.max();

    return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));
  }

  private round(value: number): number {
    // Keep a sane number of decimals so step math stays exact.
    return Math.round(value * 1e10) / 1e10;
  }

  private atMax(value: number | null): boolean {
    return value != null && this.max() != null && value >= this.max()!;
  }

  private atMin(value: number | null): boolean {
    return value != null && this.min() != null && value <= this.min()!;
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
