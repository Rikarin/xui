import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {
  ConnectedPosition,
  ConnectionPositionPair,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { PopoverPosition } from './popover.types';

@Component({
  selector: 'xui-popover',
  exportAs: 'xuiPopover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popover.component.html'
})
export class XuiPopoverComponent implements OnInit {
  private overlayRef!: OverlayRef;
  private _position: PopoverPosition = 'right';

  @Input() anchor!: HTMLElement | { elementRef: ElementRef };

  @Input() get position() {
    return this._position;
  }
  set position(value: PopoverPosition) {
    this._position = value;
    this.overlayRef?.updatePositionStrategy(this.calculatePositionStrategy());
  }

  @ViewChild('popoverTemplate', { static: true }) popoverTemplate!: TemplateRef<unknown>;

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-popover': true
    };

    ret[`x-popover-${this._position}`] = true;

    return ret;
  }

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    let config: OverlayConfig = {
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'x-popover-backdrop'
    };

    if (this.anchor) {
      config.positionStrategy = this.calculatePositionStrategy();
    }

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.detach();
    });
  }

  open() {
    const userProfilePortal = new TemplatePortal(this.popoverTemplate, this.viewContainerRef);
    this.overlayRef.attach(userProfilePortal);
  }

  private calculatePositionStrategy() {
    return this.overlay
      .position()
      .flexibleConnectedTo((this.anchor as any).elementRef ?? this.anchor)
      .withPositions([this.getPositionStrategy()])
      .withPush(false);
  }

  private getPositionStrategy(): ConnectionPositionPair {
    switch (this._position) {
      case 'right':
        return new ConnectionPositionPair(
          { originX: 'end', originY: 'center' },
          { overlayX: 'start', overlayY: 'top' }
        );
      case 'left':
        return new ConnectionPositionPair(
          { originX: 'start', originY: 'center' },
          { overlayX: 'end', overlayY: 'top' }
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
