import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { xui } from '@xui/core';
import { arrowDirection, inlineFraction, injectXDirection } from '@xui/core/a11y';
import type { ChangeFn, TouchFn } from '@xui/core/forms';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

/** Renders a tick's numeric value into label text, or `false` to hide all labels. */
export type SliderLabelRenderer = ((value: number) => string) | false;

const fillVariants = cva('absolute rounded-full', {
  variants: {
    intent: {
      none: 'bg-foreground-muted',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-error'
    }
  },
  defaultVariants: { intent: 'primary' }
});

const handleVariants = cva(
  [
    'absolute z-10 size-4 rounded-full border-2 bg-surface-raised shadow',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus:outline-none',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
  ],
  {
    variants: {
      intent: {
        none: 'border-foreground-muted',
        primary: 'border-primary',
        success: 'border-success',
        warning: 'border-warning',
        danger: 'border-error'
      },
      dragging: { true: 'cursor-grabbing', false: 'cursor-grab' }
    },
    defaultVariants: { intent: 'primary', dragging: false }
  }
);

export type SliderIntent = NonNullable<VariantProps<typeof fillVariants>['intent']>;

export const XUI_SLIDER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => XuiSlider),
  multi: true
};

/** Round away binary-float dust so stepped values stay exact (e.g. 0.1 + 0.2). */
const roundToGrid = (n: number): number => Math.round(n * 1e10) / 1e10;

@Component({
  selector: 'xui-slider',
  imports: [],
  template: `
    <div #track [class]="trackClass()" (pointerdown)="onTrackPointerDown($event)">
      @if (showTrackFill()) {
        <div [class]="fillClass()" [style]="fillStyle()"></div>
      }

      @for (tick of ticks(); track tick.value) {
        <div
          class="bg-border-strong absolute size-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
          [style]="tickStyle(tick.fraction)"
        ></div>
      }

      <div
        #handle
        role="slider"
        [class]="handleClass()"
        [style]="handleStyle()"
        [tabindex]="disabledState() ? -1 : 0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuetext]="valueText()"
        [attr.aria-orientation]="vertical() ? 'vertical' : 'horizontal'"
        [attr.aria-disabled]="disabledState() || null"
        [attr.data-disabled]="disabledState() ? '' : null"
        (keydown)="onKeydown($event)"
        (pointerdown)="onHandlePointerDown($event)"
        (blur)="onTouched?.()"
      ></div>
    </div>

    @if (labels().length) {
      <div [class]="axisClass()">
        @for (label of labels(); track label.value) {
          <span class="text-foreground-muted absolute text-xs whitespace-nowrap" [style]="labelStyle(label.fraction)">{{
            label.text
          }}</span>
        }
      </div>
    }
  `,
  host: {
    '[class]': 'computedClass()'
  },
  providers: [XUI_SLIDER_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSlider implements ControlValueAccessor {
  readonly class = input<ClassValue>('');

  readonly min = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly max = input<number, NumberInput>(10, { transform: numberAttribute });
  readonly stepSize = input<number, NumberInput>(1, { transform: numberAttribute });

  /** Spacing between rendered axis labels; `0` (or a falsy `labelRenderer`) hides them. */
  readonly labelStepSize = input<number, NumberInput>(1, { transform: numberAttribute });

  /** Format a tick value into its label, or `false` to hide the axis entirely. */
  readonly labelRenderer = input<SliderLabelRenderer>((value: number) => String(value));

  readonly intent = input<SliderIntent>('primary');
  readonly vertical = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly showTrackFill = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  private readonly disabledByForm = signal(false);
  readonly disabledState = computed(() => this.disabled() || this.disabledByForm());

  /** The current value. Two-way bindable with `[(value)]`. */
  // Aliased so the writable `value` linkedSignal can own the public name and be clamped.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly valueInput = input<number>(0, { alias: 'value' });
  readonly value = linkedSignal(() => this.clampAndSnap(this.valueInput()));

  readonly valueChange = output<number>();

  private readonly track = viewChild.required<ElementRef<HTMLDivElement>>('track');
  protected readonly direction = injectXDirection();
  private readonly handle = viewChild.required<ElementRef<HTMLDivElement>>('handle');

  protected readonly dragging = signal(false);

  protected onChange?: ChangeFn<number>;
  protected onTouched?: TouchFn;

  // --- geometry -------------------------------------------------------------

  /** 0…1 position of the current value along the track. */
  private readonly fraction = computed(() => {
    const span = this.max() - this.min();
    if (span <= 0) {
      return 0;
    }

    return Math.min(1, Math.max(0, (this.value() - this.min()) / span));
  });

  private clampAndSnap(raw: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.stepSize() || 1;
    const clamped = Math.min(max, Math.max(min, raw));
    const snapped = min + Math.round((clamped - min) / step) * step;

    return roundToGrid(Math.min(max, Math.max(min, snapped)));
  }

  /** Evenly-spaced tick marks along the track (one per step, capped for sanity). */
  protected readonly ticks = computed(() => {
    const min = this.min();
    const max = this.max();
    const step = this.stepSize() || 1;
    const span = max - min;
    const count = span / step;
    // Don't litter the track with thousands of dots on a fine step.
    if (span <= 0 || count > 100) {
      return [] as { value: number; fraction: number }[];
    }

    const out: { value: number; fraction: number }[] = [];
    for (let i = 0; i <= count + 1e-9; i++) {
      const v = roundToGrid(min + i * step);
      out.push({ value: v, fraction: (v - min) / span });
    }

    return out;
  });

  /** The axis labels rendered under (or beside) the track. */
  protected readonly labels = computed(() => {
    const renderer = this.labelRenderer();
    const stepSize = this.labelStepSize();
    const min = this.min();
    const max = this.max();
    const span = max - min;
    if (renderer === false || !stepSize || span <= 0) {
      return [] as { value: number; fraction: number; text: string }[];
    }

    const out: { value: number; fraction: number; text: string }[] = [];
    for (let v = min; v <= max + 1e-9; v += stepSize) {
      const value = roundToGrid(v);
      out.push({ value, fraction: (value - min) / span, text: renderer(value) });
    }

    return out;
  });

  protected readonly valueText = computed(() => {
    const renderer = this.labelRenderer();
    return renderer === false ? String(this.value()) : renderer(this.value());
  });

  // --- classes & styles -----------------------------------------------------

  protected readonly computedClass = computed(() =>
    xui(
      'relative select-none touch-none',
      this.vertical() ? 'inline-flex h-48 pe-8' : 'block w-full pb-6',
      this.disabledState() && 'pointer-events-none opacity-60',
      this.class()
    )
  );

  protected readonly trackClass = computed(() =>
    xui(
      'bg-surface-inset absolute rounded-full',
      this.vertical() ? 'top-0 bottom-0 start-2 w-1.5' : 'top-2 end-0 start-0 h-1.5'
    )
  );

  protected readonly fillClass = computed(() => xui(fillVariants({ intent: this.intent() })));

  protected readonly handleClass = computed(() =>
    xui(handleVariants({ intent: this.intent(), dragging: this.dragging() }))
  );

  protected readonly axisClass = computed(() =>
    xui('absolute text-xs', this.vertical() ? 'top-0 bottom-0 start-6' : 'top-6 end-0 start-0')
  );

  /**
   * Half a step back along the inline axis, for centring something positioned by
   * its inline start. `transform` is physical, so the sign flips in RTL where
   * the inline axis runs right-to-left.
   */
  private inlineHalf(): string {
    return this.direction() === 'rtl' ? '50%' : '-50%';
  }

  protected fillStyle(): Record<string, string> {
    const pct = `${this.fraction() * 100}%`;
    // `insetInlineStart` grows the fill from the track's start edge, so the bar
    // fills right-to-left in RTL without any extra maths.
    return this.vertical()
      ? { left: '0', right: '0', bottom: '0', height: pct }
      : { top: '0', bottom: '0', insetInlineStart: '0', width: pct };
  }

  protected handleStyle(): Record<string, string> {
    const pct = `${this.fraction() * 100}%`;
    // The handle lives inside the track, so 50% of the cross axis centres it on
    // the bar regardless of the track's thickness.
    return this.vertical()
      ? { left: '50%', bottom: pct, transform: 'translate(-50%, 50%)' }
      : { top: '50%', insetInlineStart: pct, transform: `translate(${this.inlineHalf()}, -50%)` };
  }

  protected tickStyle(fraction: number): Record<string, string> {
    const pct = `${fraction * 100}%`;
    return this.vertical() ? { left: '50%', bottom: pct } : { top: '50%', insetInlineStart: pct };
  }

  protected labelStyle(fraction: number): Record<string, string> {
    const pct = `${fraction * 100}%`;
    return this.vertical()
      ? { bottom: pct, transform: 'translateY(50%)' }
      : { insetInlineStart: pct, transform: `translateX(${this.inlineHalf()})` };
  }

  // --- interaction ----------------------------------------------------------

  protected onHandlePointerDown(event: PointerEvent): void {
    if (this.disabledState()) {
      return;
    }

    event.preventDefault();
    this.handle().nativeElement.focus();
    this.beginDrag(event);
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.disabledState()) {
      return;
    }

    event.preventDefault();
    // Jump to where the track was pressed, then keep dragging from there.
    this.commit(this.valueFromPointer(event));
    this.handle().nativeElement.focus();
    this.beginDrag(event);
  }

  private beginDrag(event: PointerEvent): void {
    this.dragging.set(true);
    const target = event.target as HTMLElement;
    target.setPointerCapture?.(event.pointerId);

    const move = (e: PointerEvent) => this.commit(this.valueFromPointer(e));
    const end = () => {
      this.dragging.set(false);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      this.onTouched?.();
    };

    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }

  private valueFromPointer(event: PointerEvent): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const fraction = this.vertical()
      ? (rect.bottom - event.clientY) / rect.height
      : inlineFraction(event.clientX, rect, this.direction());
    const clamped = Math.min(1, Math.max(0, fraction));

    return this.min() + clamped * (this.max() - this.min());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabledState()) {
      return;
    }

    const step = this.stepSize() || 1;
    const page = this.labelStepSize() || step * 10;
    let next: number;

    // Both axes drive the value (APG lets either pair work on a slider), but the
    // horizontal pair mirrors in RTL: ArrowRight then decreases.
    const arrow = arrowDirection(event.key, this.direction());
    if (arrow) {
      event.preventDefault();
      this.commit(this.value() + (arrow === 'next' ? step : -step));
      return;
    }

    switch (event.key) {
      case 'PageUp':
        next = this.value() + page;
        break;
      case 'PageDown':
        next = this.value() - page;
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }

    event.preventDefault();
    this.commit(next);
  }

  /** Snap, store, and notify — the single write path for every interaction. */
  private commit(raw: number): void {
    const snapped = this.clampAndSnap(raw);
    if (snapped === this.value()) {
      return;
    }

    this.value.set(snapped);
    this.valueChange.emit(snapped);
    this.onChange?.(snapped);
  }

  // --- ControlValueAccessor -------------------------------------------------

  writeValue(value: number): void {
    this.value.set(this.clampAndSnap(value ?? this.min()));
  }

  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
