import { Directive, TemplateRef } from '@angular/core';
import { DrawerComponent } from './drawer.component';

@Directive({
  selector: '[xuiDrawerFooterTemplate]',
  exportAs: 'xuiDrawerFooterTemplate'
})
export class DrawerFooterTemplateDirective {
  constructor(drawer: DrawerComponent, templateRef: TemplateRef<unknown>) {
    drawer.footerTemplate = templateRef;
  }
}
