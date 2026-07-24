import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { ESCAPE } from '@angular/cdk/keycodes';
import {
  createBlockScrollStrategy,
  createCloseScrollStrategy,
  createFlexibleConnectedPositionStrategy,
  createGlobalPositionStrategy,
  createNoopScrollStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  type OverlayConfig,
  type OverlayRef,
  type ScrollStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  Type,
  ViewContainerRef,
  inject,
  isDevMode,
  type Signal
} from '@angular/core';
import { X_OVERLAY_DEFAULTS, type XOverlayConfig, type XOverlayOrigin } from './overlay-config';
import { XOverlayRef } from './overlay-ref';
import { connectedPositions } from './placement';

/** Either a template to stamp out or a component type to instantiate. */
export type XOverlayContent<T = unknown> = TemplateRef<T> | Type<T>;

/**
 * What the factory's registry keeps per open overlay.
 *
 * Narrower than `XOverlayRef` on purpose: the ref is invariant in its result
 * type, so a list of refs with differing results cannot be typed. Callers hold
 * the fully typed ref they got back from `open()`; the registry only ever needs
 * to close things.
 */
export interface XOverlayHandle {
  close(): void;
  readonly isOpen: Signal<boolean>;
}

export interface XOverlayFactory {
  /** Open `content` in a new overlay. */
  open<TResult = unknown>(content: XOverlayContent, config?: XOverlayConfig): XOverlayRef<TResult>;
  /** Close every overlay this factory opened, newest first. */
  closeAll(): void;
  /** The overlays this factory currently has open, oldest first. */
  readonly openRefs: readonly XOverlayHandle[];
}

function toElement(origin: XOverlayOrigin): HTMLElement {
  return origin instanceof ElementRef ? origin.nativeElement : origin;
}

/**
 * Create overlays bound to the calling injection context.
 *
 * Call it from a directive, component or service constructor. The returned
 * factory captures that context's `Injector` and `ViewContainerRef`, so template
 * content is stamped in the right place, and closes anything still open when the
 * context is destroyed.
 *
 * ```ts
 * private readonly overlay = injectXOverlay();
 *
 * openMenu(trigger: HTMLElement) {
 *   this.ref = this.overlay.open(this.menuTemplate, { origin: trigger, placement: 'bottom-start' });
 * }
 * ```
 *
 * This is the single seam every xUI overlay surface — popover, tooltip, menu,
 * dialog, drawer, toast — is built on, so escape handling, outside clicks, focus
 * trapping and focus restoration behave identically across all of them.
 */
export function injectXOverlay(): XOverlayFactory {
  const injector = inject(Injector);
  const viewContainerRef = inject(ViewContainerRef, { optional: true });
  const focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  const document = inject(DOCUMENT);
  const destroyRef = inject(DestroyRef);

  const refs: XOverlayHandle[] = [];

  const scrollStrategyFor = (strategy: XOverlayConfig['scrollStrategy']): ScrollStrategy => {
    switch (strategy) {
      case 'block':
        return createBlockScrollStrategy(injector);
      case 'close':
        return createCloseScrollStrategy(injector);
      case 'noop':
        return createNoopScrollStrategy();
      default:
        return createRepositionScrollStrategy(injector);
    }
  };

  const open = <TResult = unknown>(content: XOverlayContent, config: XOverlayConfig = {}): XOverlayRef<TResult> => {
    const resolved = { ...X_OVERLAY_DEFAULTS, ...config };
    const position = resolved.position ?? (resolved.origin ? 'connected' : 'global');
    const originElement = resolved.origin ? toElement(resolved.origin) : null;

    if (position === 'connected' && !originElement) {
      throw new Error('injectXOverlay(): a connected overlay needs an `origin`.');
    }

    const overlayConfig: OverlayConfig = {
      positionStrategy:
        position === 'connected'
          ? createFlexibleConnectedPositionStrategy(injector, originElement!)
              .withPositions(connectedPositions(resolved.placement, resolved.offset, resolved.flip))
              .withFlexibleDimensions(false)
              .withPush(resolved.flip)
          : createGlobalPositionStrategy(injector).centerHorizontally().centerVertically(),
      scrollStrategy: scrollStrategyFor(resolved.scrollStrategy),
      hasBackdrop: resolved.hasBackdrop,
      backdropClass: resolved.backdropClass,
      panelClass: resolved.panelClass,
      disposeOnNavigation: true,
      ...(resolved.matchOriginWidth && originElement ? { width: originElement.getBoundingClientRect().width } : {})
    };

    const overlayRef: OverlayRef = createOverlayRef(injector, overlayConfig);
    const previouslyFocused = resolved.restoreFocus ? (document.activeElement as HTMLElement | null) : null;

    attach(overlayRef, content, resolved);
    applyAriaAttributes(overlayRef, resolved);

    const focusTrap = resolved.trapFocus ? focusTrapFactory.create(overlayRef.overlayElement) : null;

    if (resolved.autoFocus) {
      // Prefer the trap's own entry point so it honours cdkFocusInitial.
      if (focusTrap) {
        void focusTrap.focusInitialElementWhenReady();
      } else {
        overlayRef.overlayElement.focus();
      }
    }

    const ref: XOverlayRef<TResult> = new XOverlayRef<TResult>(overlayRef, focusTrap, previouslyFocused, () => {
      const index = refs.indexOf(ref);

      if (index !== -1) {
        refs.splice(index, 1);
      }
    });

    if (resolved.closeOnEscape) {
      overlayRef.keydownEvents().subscribe(event => {
        if (event.keyCode === ESCAPE && !event.defaultPrevented) {
          event.preventDefault();
          ref.close();
        }
      });
    }

    if (resolved.closeOnOutsideClick) {
      overlayRef.outsidePointerEvents().subscribe(event => {
        // A click on the trigger is the trigger's business — closing here too
        // would fight a toggle handler and leave the overlay flickering open.
        if (originElement?.contains(event.target as Node)) {
          return;
        }

        ref.close();
      });
    }

    if (resolved.hasBackdrop && resolved.closeOnBackdropClick) {
      overlayRef.backdropClick().subscribe(() => ref.close());
    }

    refs.push(ref);

    return ref;
  };

  const closeAll = () => {
    // Copy first: closing mutates `refs` through the disposal callback.
    [...refs].reverse().forEach(ref => ref.close());
  };

  destroyRef.onDestroy(closeAll);

  function attach(overlayRef: OverlayRef, content: XOverlayContent, resolved: XOverlayConfig) {
    if (content instanceof TemplateRef) {
      if (!viewContainerRef) {
        throw new Error(
          'injectXOverlay(): template content needs a ViewContainerRef. Call injectXOverlay() from a directive or component, not a root service.'
        );
      }

      overlayRef.attach(new TemplatePortal(content, viewContainerRef, resolved.context));

      return;
    }

    overlayRef.attach(
      new ComponentPortal(
        content,
        viewContainerRef,
        resolved.providers?.length
          ? Injector.create({ providers: resolved.providers as never[], parent: injector })
          : injector
      )
    );
  }

  return {
    open,
    closeAll,
    get openRefs() {
      return refs;
    }
  };
}

function applyAriaAttributes(overlayRef: OverlayRef, config: XOverlayConfig): void {
  const pane = overlayRef.overlayElement;
  const attributes: Record<string, string | null | undefined> = {
    role: config.role,
    'aria-label': config.ariaLabel,
    'aria-labelledby': config.ariaLabelledBy,
    'aria-describedby': config.ariaDescribedBy
  };

  for (const [name, value] of Object.entries(attributes)) {
    if (value) {
      pane.setAttribute(name, value);
    }
  }

  if (isDevMode() && config.role === 'dialog' && !config.ariaLabel && !config.ariaLabelledBy) {
    console.warn('injectXOverlay(): a dialog overlay should set `ariaLabel` or `ariaLabelledBy`.');
  }
}
