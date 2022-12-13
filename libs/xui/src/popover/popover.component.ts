import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { PopoverAnchor, PopoverPosition } from './popover.types';

@Component({
  selector: 'xui-popover',
  exportAs: 'xuiPopover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popover.component.html'
})
export class XuiPopoverComponent {
  private overlayRef!: OverlayRef;

  @Input() anchor!: PopoverAnchor;
  @Input() position: PopoverPosition = 'right';

  @Output() afterClosed = new EventEmitter();
  @ViewChild('popoverTemplate', { static: true }) popoverTemplate!: TemplateRef<unknown>;

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-popover': true
    };

    ret[`x-popover-${this.position}`] = true;
    return ret;
  }

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {
    let config: OverlayConfig = {
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'x-popover-backdrop'
    };

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  open(anchor?: PopoverAnchor) {
    this.overlayRef.updatePositionStrategy(this.calculatePositionStrategy(anchor ?? this.anchor));

    const userProfilePortal = new TemplatePortal(this.popoverTemplate, this.viewContainerRef);
    this.overlayRef.attach(userProfilePortal);
  }

  @HostListener('document:keydown.esc')
  close() {
    this.overlayRef.detach();
    this.afterClosed.emit();
  }

  private calculatePositionStrategy(anchor: PopoverAnchor) {
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
