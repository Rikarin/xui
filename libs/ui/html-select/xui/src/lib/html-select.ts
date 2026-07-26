import type { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
  type Signal
} from '@angular/core';
import { ControlValueAccessor, type NgControl } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matExpandMoreRound } from '@ng-icons/material-icons/round';
import { xui } from '@xui/core';
import { uniqueId } from '@xui/core/a11y';
import { XFormFieldControl } from '@xui/core/form-field';
import { createXErrorState, createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { XuiIcon } from '@xui/icon';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiHtmlSelectConfig } from './html-select.token';

const htmlSelectWrapperVariants = cva(
  'border-border bg-surface-inset text-foreground focus-within:border-focus relative inline-flex items-center rounded-lg border transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50',
  {
    variants: {
      size: { md: 'h-(--control-height-md) text-sm', sm: 'h-(--control-height-sm) text-xs' },
      fill: { true: 'w-full', false: 'w-auto' }
    },
    defaultVariants: { size: 'md', fill: false }
  }
);

export type XuiHtmlSelectVariants = VariantProps<typeof htmlSelectWrapperVariants>;

/** One `<option>` when the options come as data rather than projected markup. */
export interface XuiHtmlSelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * A styled native `<select>`.
 *
 * ```html
 * <xui-html-select [(ngModel)]="sort" [options]="['Newest', 'Oldest']" />
 * <xui-html-select [(ngModel)]="env">
 *   <option value="dev">Development</option>
 * </xui-html-select>
 * ```
 *
 * The real `<select>` underneath keeps the platform's dropdown, keyboard and
 * mobile behaviour — this only frames it and adds the chevron. Give it options
 * as data, or project `<option>` elements. It is a `ControlValueAccessor`, so
 * forms bind straight to it.
 */
@Component({
  selector: 'xui-html-select',
  imports: [NgIcon, XuiIcon],
  viewProviders: [provideIcons({ matExpandMoreRound })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideXValueAccessor(() => XuiHtmlSelect),
    {
      provide: XFormFieldControl,
      useExisting: forwardRef(() => XuiHtmlSelect)
    }
  ],
  template: `
    <select
      #field
      [id]="fieldId"
      [class]="selectClass()"
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel()"
      (change)="onSelect(field.value)"
      (blur)="cva.markTouched()"
    >
      @if (placeholder(); as ph) {
        <option value="" disabled [selected]="value() === null || value() === ''">{{ ph }}</option>
      }
      @for (option of options(); track option.value) {
        <option [value]="option.value" [disabled]="option.disabled" [selected]="option.value === value()">
          {{ option.label }}
        </option>
      }
      <ng-content />
    </select>

    <ng-icon
      xui
      size="sm"
      name="matExpandMoreRound"
      class="text-foreground-muted pointer-events-none absolute end-2.5"
    />
  `,
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiHtmlSelect<T = string> implements ControlValueAccessor, XFormFieldControl {
  private readonly config = injectXuiHtmlSelectConfig();
  private readonly formState = createXErrorState();
  protected readonly fieldId = uniqueId('xui-html-select');

  /** Error state for `xui-form-field`, derived from the optional bound form control. */
  readonly errorState = this.formState.errorState;

  /** Points the form field's `<label for>` at the native select, not the host. */
  readonly controlId: Signal<string | null> = signal(this.fieldId).asReadonly();

  get ngControl(): NgControl | null {
    return this.formState.ngControl();
  }

  /** The user-defined classes on the wrapper. Merged last so they win. */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiHtmlSelectVariants['size']>(this.config.size);
  readonly fill = input<boolean, BooleanInput>(this.config.fill, { transform: booleanAttribute });

  /** Options as data; alternatively, project `<option>` elements. */
  readonly options = input<readonly XuiHtmlSelectOption<T>[]>([]);
  /** A leading, unselectable prompt shown when nothing is chosen. */
  readonly placeholder = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly value = signal<T | string | null>(null);

  protected readonly cva = createXValueAccessor<T | string | null>({
    onWrite: value => this.value.set(value),
    disabled: this.disabled
  });
  protected readonly isDisabled = this.cva.disabled;

  protected readonly computedClass = computed(() =>
    xui(htmlSelectWrapperVariants({ size: this.size(), fill: this.fill() }), this.class())
  );
  protected readonly selectClass = computed(() =>
    xui(
      'w-full cursor-pointer appearance-none bg-transparent pe-8 ps-2.5 outline-none disabled:cursor-not-allowed',
      this.size() === 'sm' ? 'h-(--control-height-sm)' : 'h-(--control-height-md)'
    )
  );

  protected onSelect(value: string): void {
    // Recover the original typed option value (number, object) when the choice
    // came from the data-driven `options`, since the DOM only carries strings.
    const original = this.options().find(option => String(option.value) === value);
    const next = original ? original.value : value;

    this.value.set(next);
    this.cva.notifyChange(next);
  }

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
