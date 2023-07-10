import { ChangeDetectionStrategy, Component, HostBinding, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { DrawerItem, DrawerMode } from './drawer.types';
import { Portal, TemplatePortal } from '@angular/cdk/portal';
import { InputBoolean } from '../utils';

@Component({
  selector: 'xui-drawer',
  templateUrl: './drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerComponent {
  itemTemplate?: TemplateRef<unknown>;
  headerTemplate?: TemplateRef<unknown>;
  footerTemplate?: TemplateRef<unknown>;

  footerPortal?: Portal<unknown>;
  headerPortal?: Portal<unknown>;

  @Input() mode: DrawerMode = 'push';
  @Input() @InputBoolean() expanded = true;
  @Input() items!: DrawerItem[];

  @HostBinding('class.x-drawer')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-drawer-expanded')
  get hostExpandedClass(): boolean {
    return this.expanded;
  }

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    if (this.footerTemplate) {
      this.footerPortal = new TemplatePortal(this.footerTemplate, this.viewContainerRef);
    }

    if (this.headerTemplate) {
      this.headerPortal = new TemplatePortal(this.headerTemplate, this.viewContainerRef);
    }
  }

  clickGroup(item: DrawerItem) {
    if (item.children) {
      for (const x of this.items) {
        x.expanded = false;
      }

      item.expanded = true;
    }
  }
}
