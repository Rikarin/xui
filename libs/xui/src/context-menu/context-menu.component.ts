import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { XuiButtonComponent } from '../button';
import { first } from 'rxjs';
import { ContextMenuAnchor } from './context-menu.types';

@Component({
  selector: 'xui-context-menu',
  exportAs: 'xuiContextMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #templateRef>
      <div class="x-context-menu" cdkTrapFocus (click)="close()">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `
})
export class XuiContextMenuComponent {
  private overlayRef!: OverlayRef;

  @Input() anchor!: ContextMenuAnchor;
  @Output() afterClosed = new EventEmitter();

  @ViewChild('templateRef', { static: true }) templateRef!: TemplateRef<unknown>;
  @ContentChildren(XuiButtonComponent) buttons!: QueryList<XuiButtonComponent>;

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {
    let config: OverlayConfig = {
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'x-context-menu-backdrop'
    };

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  open(anchor?: ContextMenuAnchor) {
    this.overlayRef.updatePositionStrategy(this.calculatePositionStrategy(anchor ?? this.anchor));

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

  @HostListener('document:keydown.esc')
  close() {
    this.overlayRef.detach();
    this.afterClosed.emit();
  }
}
