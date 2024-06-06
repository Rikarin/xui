import { Directive, TemplateRef } from '@angular/core';
import { XuiDrawer } from './drawer';

@Directive({
  selector: '[xuiDrawerFooterTemplate]',
  exportAs: 'xuiDrawerFooterTemplate'
})
export class XuiDrawerFooterTemplate {
  constructor(drawer: XuiDrawer, templateRef: TemplateRef<unknown>) {
    drawer._footerTemplate = templateRef;
  }
}
