import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  input,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'popover.html',
  host: {
    '(document:keydown.escape)': '_close()'
  }
})
export class XuiPopover {
  private overlayRef!: OverlayRef;

  anchor = input<PopoverAnchor>();
  position = input<PopoverPosition>('right');

  @Output() afterClosed = new EventEmitter();
  @ViewChild('popoverTemplate', { static: true }) private popoverTemplate!: TemplateRef<unknown>;

  _styles = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-popover': true
    };

    ret[`x-popover-${this.position()}`] = true;
    return ret;
  });

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {
    const config: OverlayConfig = {
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'x-popover-backdrop'
    };

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => this._close());
  }

  open(anchor?: PopoverAnchor) {
    this.overlayRef.updatePositionStrategy(this.calculatePositionStrategy(anchor ?? this.anchor()!));

    const userProfilePortal = new TemplatePortal(this.popoverTemplate, this.viewContainerRef);
    this.overlayRef.attach(userProfilePortal);
  }

  _close() {
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
    switch (this.position()) {
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
