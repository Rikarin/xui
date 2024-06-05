import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  inject,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, DomPortal, TemplatePortal } from '@angular/cdk/portal';
import { SnackBarConfig } from '../config/config';
import { AriaLivePoliteness } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { xuiSnackBarAnimations } from './snack-bar-animations';
import { Observable, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { AnimationEvent } from '@angular/animations';

let uniqueId = 0;

@Component({
  selector: 'xui-snack-bar-container',
  standalone: true,
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [xuiSnackBarAnimations.snackBarState],
  templateUrl: 'snack-bar-container.html',
  host: {
    class: 'x-snack-bar',
    '[@state]': '_animationState',
    '(@state.done)': 'onAnimationEnd($event)'
  }
})
export class SnackBarContainer extends BasePortalOutlet implements OnDestroy {
  private document = inject(DOCUMENT);
  private trackedModals = new Set<Element>();

  /** aria-live value for the live region. */
  live: AriaLivePoliteness;

  /** The number of milliseconds to wait before announcing the snack bar's content. */
  private readonly _announceDelay: number = 150;

  /** The timeout for announcing the snack bar's content. */
  private _announceTimeoutId!: number;

  /** Subject for notifying that the snack bar has announced to screen readers. */
  readonly onAnnounce: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has exited from view. */
  readonly onExit: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has finished entering the view. */
  readonly onEnter: Subject<void> = new Subject();

  /** The state of the snack bar animations. */
  _animationState = 'void';

  /** Whether the component has been destroyed. */
  private _destroyed = false;

  /**
   * Element that will have the `x-snack-bar__label` class applied if the attached component
   * or template does not have it. This ensures that the appropriate structure, typography, and
   * color is applied to the attached view.
   */
  @ViewChild('label', { static: true }) label!: ElementRef;

  /**
   * Role of the live region. This is only for Firefox as there is a known issue where Firefox +
   * JAWS does not read out aria-live message.
   */
  role?: 'status' | 'alert';

  /** Unique ID of the aria-live element. */
  readonly liveElementId = `x-snack-bar-container-live-${uniqueId++}`;

  /** The portal outlet inside of this container into which the snack bar content will be loaded. */
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  constructor(
    public snackBarConfig: SnackBarConfig,
    private platform: Platform,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>
  ) {
    super();

    // Use aria-live rather than a live role like 'alert' or 'status'
    // because NVDA and JAWS have show inconsistent behavior with live roles.
    if (snackBarConfig.politeness === 'assertive' && !snackBarConfig.announcementMessage) {
      this.live = 'assertive';
    } else if (snackBarConfig.politeness === 'off') {
      this.live = 'off';
    } else {
      this.live = 'polite';
    }

    // Only set role for Firefox. Set role based on aria-live because setting role="alert" implies
    // aria-live="assertive" which may cause issues if aria-live is set to "polite" above.
    if (this.platform.FIREFOX) {
      if (this.live === 'polite') {
        this.role = 'status';
      }

      if (this.live === 'assertive') {
        this.role = 'alert';
      }
    }
  }

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    this.assertNotAttached();
    const result = this.portalOutlet.attachComponentPortal(portal);
    this.afterPortalAttached();

    return result;
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    this.assertNotAttached();
    const result = this.portalOutlet.attachTemplatePortal(portal);
    this.afterPortalAttached();

    return result;
  }

  override attachDomPortal = (portal: DomPortal) => {
    this.assertNotAttached();
    this.portalOutlet.attachDomPortal(portal);
    this.afterPortalAttached();
  };

  /** Handle end of animations, updating the state of the snackbar. */
  onAnimationEnd(event: AnimationEvent) {
    const { fromState, toState } = event;

    if ((toState === 'void' && fromState !== 'void') || toState === 'hidden') {
      this.completeExit();
    }

    if (toState === 'visible') {
      // Note: we shouldn't use `this` inside the zone callback,
      // because it can cause a memory leak.
      const onEnter = this.onEnter;

      this.ngZone.run(() => {
        onEnter.next();
        onEnter.complete();
      });
    }
  }

  /** Begin animation of snack bar entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = 'visible';
      // _animationState lives in host bindings and `detectChanges` does not refresh host bindings,
      // so we have to call `markForCheck` to ensure the host view is refreshed eventually.
      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
      this.screenReaderAnnounce();
    }
  }

  /** Begin animation of the snack bar exiting from view. */
  exit(): Observable<void> {
    // It's common for snack bars to be opened by random outside calls like HTTP requests or
    // errors. Run inside the NgZone to ensure that it functions correctly.
    this.ngZone.run(() => {
      // Note: this one transitions to `hidden`, rather than `void`, in order to handle the case
      // where multiple snack bars are opened in quick succession (e.g. two consecutive calls to
      // `XuiSnackBar.open`).
      this._animationState = 'hidden';
      this.changeDetectorRef.markForCheck();

      // Mark this element with an 'exit' attribute to indicate that the snackbar has
      // been dismissed and will soon be removed from the DOM. This is used by the snackbar
      // test harness.
      // this.elementRef.nativeElement.setAttribute('xui-exit', '');

      // If the snack bar hasn't been announced by the time it exits it wouldn't have been open
      // long enough to visually read it either, so clear the timeout for announcing.
      clearTimeout(this._announceTimeoutId);
    });

    return this.onExit;
  }

  /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
  ngOnDestroy() {
    this._destroyed = true;
    this.clearFromModals();
    this.completeExit();
  }

  /**
   * Removes the element in a microtask. Helps prevent errors where we end up
   * removing an element which is in the middle of an animation.
   */
  private completeExit() {
    queueMicrotask(() => {
      this.onExit.next();
      this.onExit.complete();
    });
  }

  /**
   * Called after the portal contents have been attached. Can be
   * used to modify the DOM once it's guaranteed to be in place.
   */
  private afterPortalAttached() {
    const element: HTMLElement = this.elementRef.nativeElement;
    const panelClasses = this.snackBarConfig.panelClass;

    if (panelClasses) {
      if (Array.isArray(panelClasses)) {
        // Note that we can't use a spread here, because IE doesn't support multiple arguments.
        panelClasses.forEach(cssClass => element.classList.add(cssClass));
      } else {
        element.classList.add(panelClasses);
      }
    }

    this.exposeToModals();

    const label = this.label.nativeElement;
    const labelClass = 'x-snack-bar__label';
    label.classList.toggle(labelClass, !label.querySelector(`.${labelClass}`));
  }

  /**
   * Some browsers won't expose the accessibility node of the live element if there is an
   * `aria-modal` and the live element is outside of it. This method works around the issue by
   * pointing the `aria-owns` of all modals to the live element.
   */
  private exposeToModals() {
    // `LiveAnnouncer` and any other usages.
    //
    // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
    // section of the DOM we need to look through. This should cover all the cases we support, but
    // the selector can be expanded if it turns out to be too narrow.
    const id = this.liveElementId;
    const modals = this.document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');

    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const ariaOwns = modal.getAttribute('aria-owns');
      this.trackedModals.add(modal);

      if (!ariaOwns) {
        modal.setAttribute('aria-owns', id);
      } else if (ariaOwns.indexOf(id) === -1) {
        modal.setAttribute('aria-owns', ariaOwns + ' ' + id);
      }
    }
  }

  /** Clears the references to the live element from any modals it was added to. */
  private clearFromModals() {
    this.trackedModals.forEach(modal => {
      const ariaOwns = modal.getAttribute('aria-owns');

      if (ariaOwns) {
        const newValue = ariaOwns.replace(this.liveElementId, '').trim();

        if (newValue.length > 0) {
          modal.setAttribute('aria-owns', newValue);
        } else {
          modal.removeAttribute('aria-owns');
        }
      }
    });
    this.trackedModals.clear();
  }

  /**
   * Starts a timeout to move the snack bar content to the live region so screen readers will
   * announce it.
   */
  private screenReaderAnnounce() {
    if (!this._announceTimeoutId) {
      this.ngZone.runOutsideAngular(() => {
        this._announceTimeoutId = setTimeout(() => {
          const inertElement = this.elementRef.nativeElement.querySelector('[aria-hidden]');
          const liveElement = this.elementRef.nativeElement.querySelector('[aria-live]');

          if (inertElement && liveElement) {
            // If an element in the snack bar content is focused before being moved
            // track it and restore focus after moving to the live region.
            let focusedElement: HTMLElement | null = null;
            if (
              this.platform.isBrowser &&
              document.activeElement instanceof HTMLElement &&
              inertElement.contains(document.activeElement)
            ) {
              focusedElement = document.activeElement;
            }

            inertElement.removeAttribute('aria-hidden');
            liveElement.appendChild(inertElement);
            focusedElement?.focus();

            this.onAnnounce.next();
            this.onAnnounce.complete();
          }
        }, this._announceDelay);
      });
    }
  }

  /** Asserts that no content is already attached to the container. */
  private assertNotAttached() {
    if (this.portalOutlet.hasAttached()) {
      throw Error('Attempting to attach snack bar content after content is already attached');
    }
  }
}
