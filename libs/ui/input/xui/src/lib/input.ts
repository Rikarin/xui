import {
  computed,
  Directive,
  forwardRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
  type Signal
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { xui } from '@xui/core';
import { XFormFieldControl } from '@xui/core/form-field';
import { XErrorStateMatcher, XErrorStateTracker } from '@xui/core/forms';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiInputConfig } from './input.token';

/** Inline padding an input reserves for an `xui-input-group` adornment, per size step. */
const ADORNMENT_LANE = {
  sm: { start: 'ps-(--control-height-sm)', end: 'pe-(--control-height-sm)' },
  md: { start: 'ps-(--control-height-md)', end: 'pe-(--control-height-md)' },
  lg: { start: 'ps-(--control-height-lg)', end: 'pe-(--control-height-lg)' }
} as const;

export const inputVariants = cva(
  [
    'flex rounded-lg border border-border font-normal transition-all',
    'file:border-0 file:text-foreground file:bg-transparent file:font-medium',
    // The focus border replaces the base outline ring. Text-entry controls match
    // `:focus-visible` for pointer focus too, so mouse users still get it.
    'focus-visible:border-focus focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      // The shared control scale from `@xui/core/styles/theme.css`, so an input lines up with a
      // button, a select and a date field of the same size.
      size: {
        sm: 'h-(--control-height-sm) px-(--control-padding-sm) text-xs',
        md: 'h-(--control-height-md) px-(--control-padding-md) text-sm',
        lg: 'h-(--control-height-lg) px-(--control-padding-lg) text-base'
      },
      // TODO(phase-4): rename the options to `default`/`subtle` when the
      // InputGroup API lands.
      surface: {
        dark: 'bg-surface-inset text-foreground placeholder:text-foreground-subtle',
        light: 'bg-surface-raised text-foreground placeholder:text-foreground-subtle'
      },
      // A deliberate accent border, distinct from the automatic invalid state.
      color: {
        none: '',
        primary: 'border-primary focus-visible:border-primary',
        success: 'border-success focus-visible:border-success',
        warning: 'border-warning focus-visible:border-warning',
        error: 'border-error focus-visible:border-error'
      },
      error: {
        auto: '[&.ng-invalid.ng-touched]:text-error [&.ng-invalid.ng-touched]:border-2 [&.ng-invalid.ng-touched]:border-error',
        true: 'text-error border-error border-2'
      }
    },
    defaultVariants: {
      size: 'md',
      surface: 'dark',
      color: 'none',
      error: 'auto'
    }
  }
);
export type XuiInputVariants = VariantProps<typeof inputVariants>;

@Directive({
  selector: '[xuiInput]',
  exportAs: 'xuiInput',
  host: {
    '[class]': 'computedClass()'
  },
  providers: [
    {
      provide: XFormFieldControl,
      useExisting: forwardRef(() => XuiInput)
    }
  ]
})
export class XuiInput implements XFormFieldControl {
  private readonly config = injectXuiInputConfig();
  private readonly injector = inject(Injector);
  private readonly defaultErrorStateMatcher = inject(XErrorStateMatcher);
  private readonly parentForm = inject(NgForm, { optional: true });
  private readonly parentFormGroup = inject(FormGroupDirective, { optional: true });

  /** The user-defined classes */
  readonly class = input<ClassValue>('');
  readonly size = input<XuiInputVariants['size']>(this.config.size);
  readonly surface = input<XuiInputVariants['surface']>(this.config.surface);
  readonly color = input<XuiInputVariants['color']>(this.config.color);
  readonly error = input<XuiInputVariants['error']>('auto');
  readonly ngControl: NgControl | null = this.injector.get(NgControl, null);

  /** Reacts to the control's own events (status, touched, submit) — no `ngDoCheck`. */
  private readonly errorStateTracker = new XErrorStateTracker(
    this.defaultErrorStateMatcher,
    this.ngControl,
    this.parentFormGroup,
    this.parentForm
  );

  /** Whether the bound control is in an error state, per the active matcher. */
  readonly errorState: Signal<boolean> = this.errorStateTracker.errorState;

  /**
   * Extra inline padding, reserved by an enclosing `xui-input-group` for the
   * left/right elements it overlays. Set by the group, not by consumers.
   */
  readonly padStart = signal(false);
  readonly padEnd = signal(false);

  /** The classes to apply to the component merged with the user-defined classes */
  protected readonly computedClass = computed(() =>
    xui(
      inputVariants({ size: this.size(), surface: this.surface(), color: this.color(), error: this.state().error }),
      // The lane an adornment occupies is one control height wide, so it scales with the field
      // instead of the flat 36px that was tuned for the old 44px input - which on a 30px field
      // reserved more space than the control was tall.
      this.padStart() && ADORNMENT_LANE[this.size() ?? 'md'].start,
      this.padEnd() && ADORNMENT_LANE[this.size() ?? 'md'].end,
      this.class()
    )
  );

  /**
   * The error variant actually rendered: forced on while the tracker reports an
   * error, otherwise whatever the `error` input asks for. `setError` overrides
   * it until the next tracker/input change.
   */
  protected readonly state = linkedSignal<{ error: XuiInputVariants['error'] }>(() => ({
    error: this.errorState() ? true : this.error()
  }));

  setError(error: XuiInputVariants['error']) {
    this.state.set({ error });
  }
}
