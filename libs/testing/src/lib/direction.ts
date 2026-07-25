import { Directionality } from '@angular/cdk/bidi';
import { EventEmitter, signal } from '@angular/core';

/**
 * Render the component under test as if it sat inside `dir="rtl"`.
 *
 * The real `Directionality` reads the document's `dir` at construction, which a
 * jsdom spec would have to mutate globally and then remember to undo. Providing
 * a stand-in keeps the direction scoped to one TestBed.
 *
 * ```ts
 * render(TEMPLATE, { imports: IMPORTS, providers: [provideDirection('rtl')] });
 * ```
 */
export function provideDirection(direction: 'ltr' | 'rtl') {
  const value = signal(direction);

  return {
    provide: Directionality,
    useValue: {
      value: direction,
      valueSignal: value,
      change: new EventEmitter<'ltr' | 'rtl'>(),
      ngOnDestroy: () => undefined
    }
  };
}
