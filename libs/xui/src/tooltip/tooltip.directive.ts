import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TooltipComponent } from './tooltip.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { PopoverAnchor } from '../popover';
import { TooltipAnchor, TooltipPosition } from './tooltip.types';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';
import { TOOLTIP_MODULE, WithConfig, XuiConfigService } from '../config';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[xuiTooltip]',
  exportAs: 'xuiTooltip'
})
export class TooltipDirective {
  static ngAcceptInputType_disabled: BooleanInput;
  private readonly _moduleName = TOOLTIP_MODULE;

  private readonly overlayRef: OverlayRef;
  private readonly portal: ComponentPortal<TooltipComponent>;

  @Input('xuiTooltip') message!: string;
  @Input('xuiTooltipPosition') position: TooltipPosition = 'right';
  @Input('xuiTooltipDisabled') @InputBoolean() @WithConfig() disabled = false;

  constructor(
    private configService: XuiConfigService,
    private elementRef: ElementRef,
    private overlay: Overlay,
    private translate: TranslateService
  ) {
    this.overlayRef = overlay.create();
    this.portal = new ComponentPortal(TooltipComponent);
  }

  @HostListener('mouseenter')
  onEnter() {
    this.show();
  }

  @HostListener('mouseleave')
  onExit() {
    this.overlayRef.detach();
  }

  public show() {
    if (this.disabled) {
      return;
    }

    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.updatePositionStrategy(this.calculatePositionStrategy(this.elementRef));
      const ref = this.overlayRef.attach(this.portal);

      ref.instance.message = this.translate.instant(this.message);
      ref.instance.position = this.position;
    }
  }

  private calculatePositionStrategy(anchor: TooltipAnchor) {
    return this.overlay
      .position()
      .flexibleConnectedTo((anchor as any)?.elementRef ?? anchor)
      .withPositions([this.getPositionStrategy()])
      .withPush(false);
  }

  private getPositionStrategy(): ConnectionPositionPair {
    switch (this.position) {
      case 'right':
        return new ConnectionPositionPair(
          { originX: 'end', originY: 'center' },
          { overlayX: 'start', overlayY: 'center' }
        );
      case 'left':
        return new ConnectionPositionPair(
          { originX: 'start', originY: 'center' },
          { overlayX: 'end', overlayY: 'center' }
        );
      case 'top':
        return new ConnectionPositionPair(
          { originX: 'center', originY: 'top' },
          { overlayX: 'center', overlayY: 'bottom' }
        );
      case 'bottom':
        return new ConnectionPositionPair(
          { originX: 'center', originY: 'bottom' },
          { overlayX: 'center', overlayY: 'top' }
        );
    }
  }
}
