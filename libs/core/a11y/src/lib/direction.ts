import { Directionality } from '@angular/cdk/bidi';
import { inject, type Signal } from '@angular/core';

/** The reading direction of the nearest `dir` ancestor. */
export type XDirection = 'ltr' | 'rtl';

/**
 * The current layout direction as a signal.
 *
 * Reads `@angular/cdk/bidi`, so it follows the nearest `[dir]` ancestor — a
 * `<div dir="rtl">` subtree inside an LTR page reports `rtl` — and updates when
 * that changes. Call it from an injection context.
 *
 * ```ts
 * private readonly direction = injectXDirection();
 * protected readonly isRtl = computed(() => this.direction() === 'rtl');
 * ```
 */
export function injectXDirection(): Signal<XDirection> {
  return inject(Directionality).valueSignal.asReadonly();
}

/**
 * Resolve an arrow key against the layout direction.
 *
 * WAI-ARIA's authoring practices define horizontal arrow keys by *visual*
 * direction: in RTL, ArrowRight moves to the previous item and ArrowLeft to the
 * next. Vertical keys never mirror. Feed it a key and get back which way the
 * widget should step — `null` for anything that is not an arrow.
 *
 * ```ts
 * const step = arrowDirection(event.key, this.direction());
 * if (step === 'next') { ... }
 * ```
 */
export function arrowDirection(key: string, direction: XDirection): 'next' | 'previous' | null {
  const rtl = direction === 'rtl';

  switch (key) {
    case 'ArrowRight':
      return rtl ? 'previous' : 'next';
    case 'ArrowLeft':
      return rtl ? 'next' : 'previous';
    case 'ArrowDown':
      return 'next';
    case 'ArrowUp':
      return 'previous';
    default:
      return null;
  }
}

/**
 * The same mapping restricted to one axis.
 *
 * A horizontal widget (tab list, slider, carousel) should ignore the vertical
 * arrows and vice versa, so pass the axis the widget actually runs along.
 */
export function arrowDirectionOnAxis(
  key: string,
  direction: XDirection,
  axis: 'horizontal' | 'vertical'
): 'next' | 'previous' | null {
  const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';

  if (horizontal !== (axis === 'horizontal')) {
    return null;
  }

  return arrowDirection(key, direction);
}

/**
 * The same mapping for a widget that holds a *value* rather than a list.
 *
 * The vertical arrows part company with {@link arrowDirection} here: APG has
 * ArrowUp increase a slider's value, where in a list it moves to the previous
 * item. The horizontal pair still mirrors in RTL.
 */
export function arrowValueDirection(key: string, direction: XDirection): 'increase' | 'decrease' | null {
  switch (key) {
    case 'ArrowUp':
      return 'increase';
    case 'ArrowDown':
      return 'decrease';
    case 'ArrowRight':
    case 'ArrowLeft': {
      const step = arrowDirection(key, direction);
      return step === 'next' ? 'increase' : 'decrease';
    }
    default:
      return null;
  }
}

/**
 * Convert a pointer offset along the inline axis into a 0–1 fraction.
 *
 * In RTL the inline axis starts at the right edge, so a slider's 0 sits where
 * LTR puts its 1. Everything that maps `clientX` onto a value — sliders, colour
 * strips, splitter gutters — needs this rather than `(x - rect.left) / width`.
 */
export function inlineFraction(clientX: number, rect: { left: number; width: number }, direction: XDirection): number {
  if (!rect.width) {
    return 0;
  }

  const fraction = (clientX - rect.left) / rect.width;

  return direction === 'rtl' ? 1 - fraction : fraction;
}
