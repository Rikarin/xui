import {
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  OnDestroy,
  Optional,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { SnackBarConfig } from '../config';
import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { SimpleSnackBar, TextOnlySnackBar } from './simple-snack-bar';
import { SnackBarRef } from './snack-bar-ref';
import { SnackBarContainer } from './snack-bar-container';
import { XUI_SNACK_BAR_DATA } from './snack-bar.types';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class XuiSnackBar implements OnDestroy {
  /**
   * Reference to the current snack bar in the view *at this level* (in the Angular injector tree).
   * If there is a parent snack-bar service, all operations should delegate to that parent
   * via `openedSnackBarRef`.
   */
  private snackBarRefAtThisLevel: SnackBarRef<any> | null = null;

  /** The component that should be rendered as the snack bar's simple component. */
  simpleSnackBarComponent = SimpleSnackBar;

  /** The container component that attaches the provided template or component. */
  snackBarContainerComponent = SnackBarContainer;

  /** The CSS class to apply for handset mode. */
  handsetCssClass = 'x-snack-bar-handset';

  /** Reference to the currently opened snackbar at *any* level. */
  get openedSnackBarRef(): SnackBarRef<any> | null {
    const parent = this.parentSnackBar;
    return parent ? parent.openedSnackBarRef : this.snackBarRefAtThisLevel;
  }

  set openedSnackBarRef(value: SnackBarRef<any> | null) {
    if (this.parentSnackBar) {
      this.parentSnackBar.openedSnackBarRef = value;
    } else {
      this.snackBarRefAtThisLevel = value;
    }
  }

  constructor(
    private overlay: Overlay,
    private live: LiveAnnouncer,
    private injector: Injector,
    private breakpointObserver: BreakpointObserver,
    @Optional() @SkipSelf() private parentSnackBar: XuiSnackBar
    // @Inject(XUI_SNACK_BAR_DEFAULT_OPTIONS) defaultConfig: XuiSnackBarConfig
  ) {}

  /**
   * Creates and dispatches a snack bar with a custom component for the content, removing any
   * currently opened snack bars.
   *
   * @param component Component to be instantiated.
   * @param config Extra configuration for the snack bar.
   */
  openFromComponent<T, D = any>(component: ComponentType<T>, config?: SnackBarConfig<D>): SnackBarRef<T> {
    return this.attach(component, config) as SnackBarRef<T>;
  }

  /**
   * Creates and dispatches a snack bar with a custom template for the content, removing any
   * currently opened snack bars.
   *
   * @param template Template to be instantiated.
   * @param config Extra configuration for the snack bar.
   */
  openFromTemplate(template: TemplateRef<any>, config?: SnackBarConfig): SnackBarRef<EmbeddedViewRef<any>> {
    return this.attach(template, config);
  }

  open(message: string, action?: string, config?: SnackBarConfig): SnackBarRef<TextOnlySnackBar> {
    // TODO
    // const _config = {...this._defaultConfig, ...config};
    const _config: SnackBarConfig = { ...config };
    _config.data = { message, action };

    // Since the snack bar has `role="alert"`, we don't
    // want to announce the same message twice.
    if (_config.announcementMessage === message) {
      _config.announcementMessage = undefined;
    }

    return this.openFromComponent(this.simpleSnackBarComponent, _config);
  }

  /**
   * Dismisses the currently-visible snack bar.
   */
  dismiss(): void {
    if (this.openedSnackBarRef) {
      this.openedSnackBarRef.dismiss();
    }
  }

  ngOnDestroy() {
    // Only dismiss the snack bar at the current level on destroy.
    if (this.snackBarRefAtThisLevel) {
      this.snackBarRefAtThisLevel.dismiss();
    }
  }

  /**
   * Attaches the snack bar container component to the overlay.
   */
  private attachSnackBarContainer(overlayRef: OverlayRef, config: SnackBarConfig): SnackBarContainer {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this.injector,
      providers: [{ provide: SnackBarConfig, useValue: config }]
    });

    const containerPortal = new ComponentPortal(this.snackBarContainerComponent, config.viewContainerRef, injector);
    const containerRef: ComponentRef<SnackBarContainer> = overlayRef.attach(containerPortal);
    // TODO: check if this was already provided by Injector
    // containerRef.instance.snackBarConfig = config;
    return containerRef.instance;
  }

  /**
   * Places a new component or a template as the content of the snack bar container.
   */
  private attach<T>(
    content: ComponentType<T> | TemplateRef<T>,
    userConfig?: SnackBarConfig
  ): SnackBarRef<T | EmbeddedViewRef<any>> {
    // TODO
    // const config = {...new SnackBarConfig(), ...this.defaultConfig, ...userConfig};
    const config = { ...new SnackBarConfig(), ...userConfig };
    const overlayRef = this.createOverlay(config);
    const container = this.attachSnackBarContainer(overlayRef, config);
    const snackBarRef = new SnackBarRef<T | EmbeddedViewRef<any>>(container, overlayRef);

    if (content instanceof TemplateRef) {
      const portal = new TemplatePortal(content, null!, {
        $implicit: config.data,
        snackBarRef
      } as any);

      snackBarRef.instance = container.attachTemplatePortal(portal);
    } else {
      const injector = this.createInjector(config, snackBarRef);
      const portal = new ComponentPortal(content, undefined!, injector);
      const contentRef = container.attachComponentPortal<T>(portal);

      // We can't pass this via the injector, because the injector is created earlier.
      snackBarRef.instance = contentRef.instance;
    }

    // Subscribe to the breakpoint observer and attach the mat-snack-bar-handset class as
    // appropriate. This class is applied to the overlay element because the overlay must expand to
    // fill the width with the screen for full width snackbars.
    this.breakpointObserver
      .observe(Breakpoints.HandsetPortrait)
      .pipe(takeUntil(overlayRef.detachments()))
      .subscribe(state => {
        overlayRef.overlayElement.classList.toggle(this.handsetCssClass, state.matches);
      });

    if (config.announcementMessage) {
      // Wait until the snack bar contents have been announced then deliver this message.
      container.onAnnounce.subscribe(() => {
        this.live.announce(config.announcementMessage!, config.politeness);
      });
    }

    this.animateSnackBar(snackBarRef, config);
    this.openedSnackBarRef = snackBarRef;

    return this.openedSnackBarRef;
  }

  /** Animates the old snack bar out and the new one in. */
  private animateSnackBar(snackBarRef: SnackBarRef<any>, config: SnackBarConfig) {
    // When the snackbar is dismissed, clear the reference to it.
    snackBarRef.afterDismissed().subscribe(() => {
      // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
      if (this.openedSnackBarRef == snackBarRef) {
        this.openedSnackBarRef = null;
      }

      if (config.announcementMessage) {
        this.live.clear();
      }
    });

    if (this.openedSnackBarRef) {
      // If a snack bar is already in view, dismiss it and enter the
      // new snack bar after exit animation is complete.
      this.openedSnackBarRef.afterDismissed().subscribe(() => {
        snackBarRef.containerInstance.enter();
      });
      this.openedSnackBarRef.dismiss();
    } else {
      // If no snack bar is in view, enter the new snack bar.
      snackBarRef.containerInstance.enter();
    }

    // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
    if (config.duration && config.duration > 0) {
      snackBarRef.afterOpened().subscribe(() => snackBarRef._dismissAfter(config.duration!));
    }
  }

  /**
   * Creates a new overlay and places it in the correct location.
   * @param config The user-specified snack bar config.
   */
  private createOverlay(config: SnackBarConfig): OverlayRef {
    const overlayConfig = new OverlayConfig();
    overlayConfig.direction = config.direction;

    const positionStrategy = this.overlay.position().global();
    // Set horizontal position.
    const isRtl = config.direction === 'rtl';
    const isLeft =
      config.horizontalPosition === 'left' ||
      (config.horizontalPosition === 'start' && !isRtl) ||
      (config.horizontalPosition === 'end' && isRtl);
    const isRight = !isLeft && config.horizontalPosition !== 'center';

    if (isLeft) {
      positionStrategy.left('0');
    } else if (isRight) {
      positionStrategy.right('0');
    } else {
      positionStrategy.centerHorizontally();
    }

    // Set horizontal position.
    if (config.verticalPosition === 'top') {
      positionStrategy.top('0');
    } else {
      positionStrategy.bottom('0');
    }

    overlayConfig.positionStrategy = positionStrategy;
    return this.overlay.create(overlayConfig);
  }

  /**
   * Creates an injector to be used inside a snack bar component.
   * @param config Config that was used to create the snack bar.
   * @param snackBarRef Reference to the snack bar.
   */
  private createInjector<T>(config: SnackBarConfig, snackBarRef: SnackBarRef<T>): Injector {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;

    return Injector.create({
      parent: userInjector || this.injector,
      providers: [
        { provide: SnackBarRef, useValue: snackBarRef },
        { provide: XUI_SNACK_BAR_DATA, useValue: config.data }
      ]
    });
  }
}
