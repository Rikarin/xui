import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
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

function globalPositionStrategy(injector: Injector, position: XOverlayConfig['globalPosition']) {
  const strategy = createGlobalPositionStrategy(injector);

  if (!position) {
    return strategy.centerHorizontally().centerVertically();
  }

  if (position.top != null) {
    strategy.top(position.top);
  }
  if (position.right != null) {
    strategy.right(position.right);
  }
  if (position.bottom != null) {
    strategy.bottom(position.bottom);
  }
  if (position.left != null) {
    strategy.left(position.left);
  }
  if (position.centerHorizontally) {
    strategy.centerHorizontally();
  }
  if (position.centerVertically) {
    strategy.centerVertically();
  }

  return strategy;
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
  const directionality = inject(Directionality);
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
          : globalPositionStrategy(injector, resolved.globalPosition),
      scrollStrategy: scrollStrategyFor(resolved.scrollStrategy),
      // Without this the CDK treats every connected position as LTR, so a
      // `*-start` placement anchors to the left edge even in an RTL page.
      direction: directionality,
      hasBackdrop: resolved.hasBackdrop,
      backdropClass: resolved.backdropClass,
      panelClass: resolved.panelClass,
      disposeOnNavigation: true,
      ...(resolved.matchOriginWidth && originElement ? { width: originElement.getBoundingClientRect().width } : {})
    };

    const overlayRef: OverlayRef = createOverlayRef(injector, overlayConfig);
    const previouslyFocused = resolved.restoreFocus ? (document.activeElement as HTMLElement | null) : null;

    // Trapping Tab without hiding the background still lets a screen reader
    // browse past the barrier, so anything that traps focus *and* dims the page
    // behind a backdrop is treated as modal. A focus-trapping popover has no
    // backdrop and closes on outside clicks, so it stays non-modal — `inert`
    // would swallow the very clicks it listens for.
    const modal = resolved.modal ?? Boolean(resolved.trapFocus && resolved.hasBackdrop);

    attach(overlayRef, content, resolved);
    applyAriaAttributes(overlayRef, resolved, modal);

    const releaseBackground = modal ? inertBackground(overlayRef) : null;

    const focusTrap = resolved.trapFocus ? focusTrapFactory.create(overlayRef.overlayElement) : null;

    if (resolved.autoFocus) {
      // Prefer the trap's own entry point so it honours cdkFocusInitial.
      if (focusTrap) {
        void focusTrap.focusInitialElementWhenReady();
      } else {
        overlayRef.overlayElement.focus();
      }
    }

    const ref: XOverlayRef<TResult> = new XOverlayRef<TResult>(overlayRef, focusTrap, previouslyFocused, releaseBackground, () => {
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

function applyAriaAttributes(overlayRef: OverlayRef, config: XOverlayConfig, modal: boolean): void {
  const pane = overlayRef.overlayElement;
  const attributes: Record<string, string | null | undefined> = {
    role: config.role,
    'aria-label': config.ariaLabel,
    'aria-labelledby': config.ariaLabelledBy,
    'aria-describedby': config.ariaDescribedBy,
    // Only meaningful on a dialog role; a modal menu or listbox is not a thing.
    'aria-modal': modal && (config.role === 'dialog' || config.role === 'alertdialog') ? 'true' : null
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

/**
 * Hide everything outside the overlay from assistive tech while a modal is open.
 *
 * `aria-modal` alone is not enough — support is uneven, and a screen reader in
 * browse mode can still walk the page behind the dialog. Marking the overlay's
 * siblings `inert` removes them from the accessibility tree *and* from the tab
 * order, which is the behaviour `<dialog>.showModal()` gets for free.
 *
 * Returns the undo function. Nested modals stack: the second modal inerts the
 * first one's container, and unwinding in reverse restores each layer.
 */
function inertBackground(overlayRef: OverlayRef): () => void {
  const container = overlayRef.hostElement.parentElement;
  const body = container?.ownerDocument.body;

  if (!container || !body) {
    return () => undefined;
  }

  // Set the attribute rather than the IDL property: it is what the a11y tree
  // reads, it round-trips in jsdom, and skipping already-inert siblings keeps
  // nested modals from clearing an outer one's work on the way out.
  const inerted = [...body.children].filter(
    (element): element is HTMLElement =>
      element !== container && element instanceof HTMLElement && !element.hasAttribute('inert')
  );

  inerted.forEach(element => element.setAttribute('inert', ''));

  return () => inerted.forEach(element => element.removeAttribute('inert'));
}
