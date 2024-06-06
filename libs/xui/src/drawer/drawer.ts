import { ChangeDetectionStrategy, Component, input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { DrawerItem, DrawerMode } from './drawer.types';
import { Portal, TemplatePortal } from '@angular/cdk/portal';
import { convertToBoolean } from '../utils';

@Component({
  selector: 'xui-drawer',
  templateUrl: 'drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'x-drawer',
    '[class.x-drawer-expanded]': 'expanded()'
  }
})
export class XuiDrawer implements OnInit {
  _itemTemplate?: TemplateRef<unknown>;
  _headerTemplate?: TemplateRef<unknown>;
  _footerTemplate?: TemplateRef<unknown>;

  _footerPortal?: Portal<unknown>;
  _headerPortal?: Portal<unknown>;

  mode = input<DrawerMode>('push');
  expanded = input(true, { transform: (v: string | boolean) => convertToBoolean(v) });
  items = input<DrawerItem[]>([]);

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    if (this._footerTemplate) {
      this._footerPortal = new TemplatePortal(this._footerTemplate, this.viewContainerRef);
    }

    if (this._headerTemplate) {
      this._headerPortal = new TemplatePortal(this._headerTemplate, this.viewContainerRef);
    }
  }

  clickGroup(item: DrawerItem) {
    if (item.children) {
      for (const x of this.items()) {
        x.expanded = false;
      }

      item.expanded = true;
    }
  }
}
