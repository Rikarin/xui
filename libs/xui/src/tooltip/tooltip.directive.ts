import { booleanAttribute, Directive, ElementRef, input } from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Tooltip } from './tooltip';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipAnchor, TooltipPosition } from './tooltip.types';
import { TOOLTIP_MODULE, XuiConfigService } from '../config';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[xuiTooltip]',
  exportAs: 'xuiTooltip',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': '_overlayRef.detach()'
  }
})
export class XuiTooltip {
  private readonly _moduleName = TOOLTIP_MODULE;

  readonly _overlayRef: OverlayRef;
  private readonly portal: ComponentPortal<Tooltip>;

  message = input.required<string>({ alias: 'xuiTooltip' });
  position = input<TooltipPosition>('right', { alias: 'xuiTooltipPosition' });
  disabled = input(false, { transform: booleanAttribute, alias: 'xuiTooltipDisabled' });

  constructor(
    private configService: XuiConfigService,
    private elementRef: ElementRef,
    private overlay: Overlay,
    private translate: TranslateService
  ) {
    this._overlayRef = overlay.create();
    this.portal = new ComponentPortal(Tooltip);
  }

  public show() {
    if (this.disabled()) {
      return;
    }

    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.updatePositionStrategy(this.calculatePositionStrategy(this.elementRef));
      const ref = this._overlayRef.attach(this.portal);

      ref.setInput('message', this.translate.instant(this.message()));
      ref.setInput('position', this.position());
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
    switch (this.position()) {
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
