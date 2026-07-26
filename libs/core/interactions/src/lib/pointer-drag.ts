import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, PLATFORM_ID, inject } from '@angular/core';

export interface XPointerDragHandlers {
  /** Called for every pointer move while the drag is active. */
  onMove(event: PointerEvent): void;
  /** Called once, with the final `pointerup`/`pointercancel`. Skipped when the drag is stopped programmatically. */
  onEnd?(event: PointerEvent): void;
}

export interface XPointerDragOptions {
  /**
   * Element that should hold the pointer capture for the duration of the drag.
   * Defaults to the element the start event was dispatched on.
   */
  captureTarget?: HTMLElement;
}

/** Stops the active drag and detaches its listeners without firing `onEnd`. Idempotent. */
export type XPointerDragStop = () => void;

export type XPointerDragStartFn = (
  event: PointerEvent | MouseEvent,
  handlers: XPointerDragHandlers,
  options?: XPointerDragOptions
) => XPointerDragStop;

const NOOP_STOP: XPointerDragStop = () => undefined;

/**
 * The one pointer-drag loop: call the returned function from a `pointerdown`
 * handler and it follows the pointer until release — sliders, splitter gutters,
 * column resizing, dock-pane dragging all share this plumbing.
 *
 * The pointer is captured on the pressed element when the platform supports it,
 * so the stream keeps flowing when a touch drag leaves the element; the
 * listeners themselves sit on the document (where captured events bubble to
 * anyway), which doubles as the fallback for plain mouse events and for test
 * environments without pointer capture. Listening uses pointer events, so touch
 * and pen work wherever mouse does.
 *
 * One drag is active per injected instance — starting a new drag replaces the
 * previous one — and because this was created in an injection context, an
 * in-flight drag is torn down via `DestroyRef` if the component dies mid-drag.
 */
export function injectXPointerDrag(): XPointerDragStartFn {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const destroyRef = inject(DestroyRef);

  if (!isBrowser) {
    return () => NOOP_STOP;
  }

  let stopActive: XPointerDragStop | null = null;
  destroyRef.onDestroy(() => stopActive?.());

  return (event, handlers, options = {}) => {
    // One pointer at a time: a new drag replaces whatever is still tracking.
    stopActive?.();

    const target = options.captureTarget ?? (event.target instanceof HTMLElement ? event.target : null);
    const doc = target?.ownerDocument ?? document;
    const pointerId = 'pointerId' in event ? event.pointerId : undefined;
    let stopped = false;

    const stop: XPointerDragStop = () => {
      if (stopped) {
        return;
      }

      stopped = true;
      doc.removeEventListener('pointermove', move);
      doc.removeEventListener('pointerup', end);
      doc.removeEventListener('pointercancel', end);

      if (typeof pointerId === 'number') {
        // Optional-chained and guarded: jsdom implements neither method.
        try {
          if (target?.hasPointerCapture?.(pointerId)) {
            target.releasePointerCapture(pointerId);
          }
        } catch {
          // The pointer is already gone; nothing left to release.
        }
      }

      if (stopActive === stop) {
        stopActive = null;
      }
    };

    const move = (moveEvent: Event): void => handlers.onMove(moveEvent as PointerEvent);
    const end = (endEvent: Event): void => {
      stop();
      handlers.onEnd?.(endEvent as PointerEvent);
    };

    if (typeof pointerId === 'number') {
      try {
        target?.setPointerCapture?.(pointerId);
      } catch {
        // An inactive pointer id — the document listeners still see every move.
      }
    }

    doc.addEventListener('pointermove', move);
    doc.addEventListener('pointerup', end);
    doc.addEventListener('pointercancel', end);
    stopActive = stop;

    return stop;
  };
}
