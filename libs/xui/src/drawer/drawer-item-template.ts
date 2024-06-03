import { Directive, TemplateRef } from '@angular/core';
import { XuiDrawer } from './drawer';

@Directive({
  selector: '[xuiDrawerItemTemplate]',
  exportAs: 'xuiDrawerItemTemplate'
})
export class XuiDrawerItemTemplate {
  constructor(drawer: XuiDrawer, templateRef: TemplateRef<unknown>) {
    drawer.itemTemplate = templateRef;
  }
}
