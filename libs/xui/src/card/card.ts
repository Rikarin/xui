import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Portal, TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'xui-card',
  templateUrl: 'card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'x-card'
  }
})
export class XuiCard implements OnInit {
  titleDirective?: TemplateRef<unknown>;
  actionsDirective?: TemplateRef<unknown>;

  titlePortal?: Portal<unknown>;
  actionsPortal?: Portal<unknown>;

  // @Input() loading!: boolean;

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    if (this.titleDirective) {
      this.titlePortal = new TemplatePortal(this.titleDirective, this.viewContainerRef);
    }

    if (this.actionsDirective) {
      this.actionsPortal = new TemplatePortal(this.actionsDirective, this.viewContainerRef);
    }
  }
}
