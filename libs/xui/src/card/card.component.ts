import { Portal, TemplatePortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { inNextTick } from '../utils';

@Component({
  selector: 'xui-card',
  exportAs: 'xuiCard',
  templateUrl: './card.component.html',
  encapsulation: ViewEncapsulation.None
})
export class XuiCardComponent implements AfterViewInit {
  titlePortal: Portal<any>;
  extraPortal: Portal<any>;
  actionsPortal: Portal<any>;

  @Input() loading: boolean;
  @Input() title?: string | TemplateRef<any>;
  @Input() extra?: TemplateRef<any>;
  @Input() actions?: TemplateRef<any>;

  @ViewChild('titleText') titleText: TemplateRef<unknown>;

  constructor(private viewContainerRef: ViewContainerRef) {}

  async ngAfterViewInit() {
    await inNextTick();

    this.renderTitle();
    this.renderExtra();
    this.renderActions();
  }

  private renderTitle() {
    if (!this.title) {
      return;
    }

    if (this.title instanceof TemplateRef) {
      this.titlePortal = new TemplatePortal(this.title, this.viewContainerRef);
    } else {
      this.titlePortal = new TemplatePortal(this.titleText, this.viewContainerRef);
    }
  }

  private renderExtra() {
    if (!this.extra) {
      return;
    }

    if (!(this.extra instanceof TemplateRef)) {
      throw new Error('extra is not a TemplateRef');
    }

    this.extraPortal = new TemplatePortal(this.extra, this.viewContainerRef);
  }

  private renderActions() {
    if (!this.actions) {
      return;
    }

    if (!(this.actions instanceof TemplateRef)) {
      throw new Error('actions is not a TemplateRef');
    }

    this.actionsPortal = new TemplatePortal(this.actions, this.viewContainerRef);
  }
}
