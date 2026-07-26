import { Directive, effect, output } from '@angular/core';
import { injectXElementSize, type XElementSize } from './element-size';

/**
 * Emit whenever the host element's size changes.
 *
 * The declarative face of {@link injectXElementSize}:
 *
 * ```html
 * <div xResizeSensor (xResize)="onResize($event)">…</div>
 * ```
 */
@Directive({
  selector: '[xResizeSensor]',
  exportAs: 'xResizeSensor'
})
export class XResizeSensor {
  /** The host's current content-box size. */
  readonly size = injectXElementSize();

  /** Emits the host's content-box size whenever it changes, starting with its initial size. */
  readonly xResize = output<XElementSize>();

  constructor() {
    let previous: XElementSize | null = null;

    effect(() => {
      const next = this.size();

      // The signal starts at 0×0 before the first observation; that is "not
      // measured yet", not a resize, so hold it back until something real lands.
      if (previous === null && next.width === 0 && next.height === 0) {
        return;
      }

      if (previous?.width === next.width && previous?.height === next.height) {
        return;
      }

      previous = next;
      this.xResize.emit(next);
    });
  }
}
