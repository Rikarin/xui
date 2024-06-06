import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  effect,
  EventEmitter,
  input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { XuiButton } from '../button';
import { first } from 'rxjs';
import { ContextMenuAnchor } from './context-menu.types';

@Component({
  selector: 'xui-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #templateRef>
    <div class="x-context-menu" cdkTrapFocus cdkTrapFocusAutoCapture (click)="close()">
      <ng-content />
    </div>
  </ng-template>`,
  host: {
    '(document:keydown.esc)': 'close()'
  }
})
export class XuiContextMenu {
  private overlayRef!: OverlayRef;

  anchor = input<ContextMenuAnchor>();
  @Output() afterClosed = new EventEmitter();

  @ViewChild('templateRef', { static: true }) private templateRef!: TemplateRef<unknown>;
  @ContentChildren(XuiButton) private buttons!: QueryList<XuiButton>;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {
    const config: OverlayConfig = {
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'x-context-menu-backdrop'
    };

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    effect(() => {
      this.overlayRef.updatePositionStrategy(this.calculatePositionStrategy(this.anchor()!));
    });
  }

  open(anchor?: ContextMenuAnchor) {
    this.overlayRef.updatePositionStrategy(this.calculatePositionStrategy(anchor ?? this.anchor()!));

    const userProfilePortal = new TemplatePortal(this.templateRef, this.viewContainerRef);
    this.overlayRef.attach(userProfilePortal);

    for (const btn of this.buttons) {
      btn.click.pipe(first()).subscribe(() => this.close());
    }
  }

  private calculatePositionStrategy(anchor: ContextMenuAnchor) {
    return this.overlay
      .position()
      .flexibleConnectedTo((anchor as any)?.elementRef ?? anchor)
      .withPositions([
        new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' })
      ])
      .withPush(false);
  }

  close() {
    this.overlayRef.detach();
    this.afterClosed.emit();
  }
}
