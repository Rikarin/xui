import { Directive, TemplateRef } from '@angular/core';
import { XuiDrawer } from './drawer';

@Directive({
  selector: '[xuiDrawerHeaderTemplate]',
  exportAs: 'xuiDrawerHeaderTemplate'
})
export class XuiDrawerHeaderTemplate {
  constructor(drawer: XuiDrawer, templateRef: TemplateRef<unknown>) {
    drawer.headerTemplate = templateRef;
  }
}
