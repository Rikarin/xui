import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, PLATFORM_ID, inject, signal, type Signal } from '@angular/core';

export interface XElementSize {
  width: number;
  height: number;
}

const EMPTY: XElementSize = { width: 0, height: 0 };

/**
 * Track an element's content-box size.
 *
 * This is the primitive behind {@link XResizeSensor}, and the measurement step
 * for overflow lists, auto-resizing textareas and the data grid's column
 * sizing. Returns a signal so consumers stay pull-based instead of wiring up
 * their own change detection.
 *
 * On the server, and anywhere `ResizeObserver` is unavailable, the signal stays
 * at 0×0 rather than throwing — callers should treat that as "not measured yet".
 */
export function injectElementSize(elementRef?: ElementRef<HTMLElement>): Signal<XElementSize> {
  const target = elementRef ?? inject(ElementRef<HTMLElement>);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const size = signal<XElementSize>(EMPTY);

  if (!isBrowser || typeof ResizeObserver === 'undefined') {
    return size.asReadonly();
  }

  const element = target.nativeElement;
  const observer = new ResizeObserver(entries => {
    const entry = entries[0];

    if (!entry) {
      return;
    }

    // contentRect is the content box, matching what layout code needs; the
    // border-box variants are not supported in every browser we target.
    size.set({ width: entry.contentRect.width, height: entry.contentRect.height });
  });

  observer.observe(element);
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return size.asReadonly();
}
