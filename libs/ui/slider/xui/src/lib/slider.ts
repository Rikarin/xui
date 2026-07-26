import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { xui } from '@xui/core';
import { arrowValueDirection, injectXDirection, inlineFraction } from '@xui/core/a11y';
import { createXValueAccessor, provideXValueAccessor } from '@xui/core/forms';
import { injectXPointerDrag } from '@xui/core/interactions';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiSliderConfig } from './slider.token';

/** Renders a tick's numeric value into label text, or `false` to hide all labels. */
export type XuiSliderLabelRenderer = ((value: number) => string) | false;

export const sliderFillVariants = cva('absolute rounded-full', {
  variants: {
    color: {
      none: 'bg-foreground-muted',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error'
    }
  },
  defaultVariants: { color: 'primary' }
});

export const sliderHandleVariants = cva(
  [
    // eslint-disable-next-line local/no-hand-z-index -- the thumb rides above the track inside the slider, not an overlay
    'absolute z-10 size-4 rounded-full border-2 bg-surface-raised shadow-elevation-1',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
  ],
  {
    variants: {
      color: {
        none: 'border-foreground-muted',
        primary: 'border-primary',
        success: 'border-success',
        warning: 'border-warning',
        error: 'border-error'
      },
      dragging: { true: 'cursor-grabbing', false: 'cursor-grab' }
    },
    defaultVariants: { color: 'primary', dragging: false }
  }
);

export type XuiSliderColor = NonNullable<VariantProps<typeof sliderFillVariants>['color']>;

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
        [tabindex]="isDisabled() ? -1 : 0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuetext]="valueText()"
        [attr.aria-orientation]="orientation()"
        [attr.aria-disabled]="isDisabled() || null"
        [attr.data-disabled]="isDisabled() ? '' : null"
        (keydown)="onKeydown($event)"
        (pointerdown)="onHandlePointerDown($event)"
        (blur)="cva.markTouched()"
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
  providers: [provideXValueAccessor(() => XuiSlider)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiSlider implements ControlValueAccessor {
  private readonly config = injectXuiSliderConfig();

  readonly class = input<ClassValue>('');

  readonly min = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly max = input<number, NumberInput>(10, { transform: numberAttribute });
  readonly stepSize = input<number, NumberInput>(1, { transform: numberAttribute });

  /** Spacing between rendered axis labels; `0` (or a falsy `labelRenderer`) hides them. */
  readonly labelStepSize = input<number, NumberInput>(1, { transform: numberAttribute });

  /** Format a tick value into its label, or `false` to hide the axis entirely. */
  readonly labelRenderer = input<XuiSliderLabelRenderer>((value: number) => String(value));

  readonly color = input<XuiSliderColor>(this.config.color);
  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation);
  readonly showTrackFill = input<boolean, BooleanInput>(this.config.showTrackFill, { transform: booleanAttribute });

  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  protected readonly cva = createXValueAccessor<number>({
    onWrite: value => this.value.set(this.clampAndSnap(value ?? this.min())),
    disabled: this.disabled
  });
  readonly isDisabled = this.cva.disabled;

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

  /** Evenly-spaced tick marks along the track — one per axis interval, so a dot sits under each label. */
  protected readonly ticks = computed(() => {
    const min = this.min();
    const max = this.max();
    // The axis interval, not the value granularity. `stepSize` is how finely the handle moves,
    // which on a 0–100 range stepping by 1 drew a hundred dots beneath six labels; a tick marks a
    // place on the axis, so it belongs on the same grid the labels use.
    const step = this.labelStepSize() || this.stepSize() || 1;
    const span = max - min;
    const count = span / step;
    // Don't litter the track with thousands of dots on a fine axis.
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
      this.orientation() === 'vertical' ? 'inline-flex h-48 pe-8' : 'block w-full pb-6',
      this.isDisabled() && 'pointer-events-none opacity-60',
      this.class()
    )
  );

  protected readonly trackClass = computed(() =>
    xui(
      'bg-surface-inset absolute rounded-full',
      this.orientation() === 'vertical' ? 'top-0 bottom-0 start-2 w-1.5' : 'top-2 end-0 start-0 h-1.5'
    )
  );

  protected readonly fillClass = computed(() => xui(sliderFillVariants({ color: this.color() })));

  protected readonly handleClass = computed(() =>
    xui(sliderHandleVariants({ color: this.color(), dragging: this.dragging() }))
  );

  protected readonly axisClass = computed(() =>
    xui('absolute text-xs', this.orientation() === 'vertical' ? 'top-0 bottom-0 start-6' : 'top-6 end-0 start-0')
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
    return this.orientation() === 'vertical'
      ? { left: '0', right: '0', bottom: '0', height: pct }
      : { top: '0', bottom: '0', insetInlineStart: '0', width: pct };
  }

  protected handleStyle(): Record<string, string> {
    const pct = `${this.fraction() * 100}%`;
    // The handle lives inside the track, so 50% of the cross axis centres it on
    // the bar regardless of the track's thickness.
    return this.orientation() === 'vertical'
      ? { left: '50%', bottom: pct, transform: 'translate(-50%, 50%)' }
      : { top: '50%', insetInlineStart: pct, transform: `translate(${this.inlineHalf()}, -50%)` };
  }

  protected tickStyle(fraction: number): Record<string, string> {
    const pct = `${fraction * 100}%`;
    return this.orientation() === 'vertical' ? { left: '50%', bottom: pct } : { top: '50%', insetInlineStart: pct };
  }

  protected labelStyle(fraction: number): Record<string, string> {
    const pct = `${fraction * 100}%`;
    return this.orientation() === 'vertical'
      ? { bottom: pct, transform: 'translateY(50%)' }
      : { insetInlineStart: pct, transform: `translateX(${this.inlineHalf()})` };
  }

  // --- interaction ----------------------------------------------------------

  protected onHandlePointerDown(event: PointerEvent): void {
    if (this.isDisabled()) {
      return;
    }

    event.preventDefault();
    this.handle().nativeElement.focus();
    this.beginDrag(event);
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) {
      return;
    }

    event.preventDefault();
    // Jump to where the track was pressed, then keep dragging from there.
    this.commit(this.valueFromPointer(event));
    this.handle().nativeElement.focus();
    this.beginDrag(event);
  }

  private readonly startDrag = injectXPointerDrag();

  private beginDrag(event: PointerEvent): void {
    this.dragging.set(true);
    this.startDrag(event, {
      onMove: moveEvent => this.commit(this.valueFromPointer(moveEvent)),
      onEnd: () => {
        this.dragging.set(false);
        this.cva.markTouched();
      }
    });
  }

  private valueFromPointer(event: PointerEvent): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const fraction =
      this.orientation() === 'vertical'
        ? (rect.bottom - event.clientY) / rect.height
        : inlineFraction(event.clientX, rect, this.direction());
    const clamped = Math.min(1, Math.max(0, fraction));

    return this.min() + clamped * (this.max() - this.min());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }

    const step = this.stepSize() || 1;
    const page = this.labelStepSize() || step * 10;
    let next: number;

    // Both axes drive the value (APG lets either pair work on a slider): Up/Right
    // increase, Down/Left decrease — with the horizontal pair mirrored in RTL,
    // where ArrowRight walks the value down.
    const arrow = arrowValueDirection(event.key, this.direction());
    if (arrow) {
      event.preventDefault();
      this.commit(this.value() + (arrow === 'increase' ? step : -step));
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
    this.cva.notifyChange(snapped);
  }

  // --- ControlValueAccessor -------------------------------------------------

  readonly writeValue = this.cva.writeValue;
  readonly registerOnChange = this.cva.registerOnChange;
  readonly registerOnTouched = this.cva.registerOnTouched;
  readonly setDisabledState = this.cva.setDisabledState;
}
