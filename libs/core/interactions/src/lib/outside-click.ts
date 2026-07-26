import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, PLATFORM_ID, inject } from '@angular/core';

export interface XOutsideClickOptions {
  /** Elements that count as "inside" in addition to the target — triggers, portals. */
  ignore?: ReadonlyArray<ElementRef<HTMLElement> | HTMLElement | null | undefined>;
  /** Which event settles it. `pointerdown` fires before focus moves; `click` after. */
  event?: 'pointerdown' | 'mousedown' | 'click';
}

function elementOf(value: ElementRef<HTMLElement> | HTMLElement): HTMLElement {
  return value instanceof ElementRef ? value.nativeElement : value;
}

/**
 * Run `handler` when a pointer event lands outside `target`.
 *
 * Overlay surfaces get this from `@xui/core/overlay`; this is for the
 * non-overlay cases — inline editors, expanding search fields, anything that
 * dismisses on click-away without a CDK overlay behind it.
 *
 * The listener is attached in the capture phase so a handler that stops
 * propagation inside the page cannot silently disable dismissal, and it is
 * removed when the calling injection context is destroyed.
 */
export function injectXOutsideClick(
  handler: (event: Event) => void,
  options: XOutsideClickOptions = {},
  target?: ElementRef<HTMLElement>
): void {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  if (!isBrowser) {
    return;
  }

  const host = target ?? inject(ElementRef<HTMLElement>);
  const { ignore = [], event = 'pointerdown' } = options;

  const listener = (domEvent: Event) => {
    const node = domEvent.target as Node | null;

    if (!node || !node.isConnected) {
      return;
    }

    if (host.nativeElement.contains(node)) {
      return;
    }

    const ignored = ignore.some(candidate => candidate && elementOf(candidate).contains(node));

    if (ignored) {
      return;
    }

    handler(domEvent);
  };

  document.addEventListener(event, listener, true);
  inject(DestroyRef).onDestroy(() => document.removeEventListener(event, listener, true));
}
