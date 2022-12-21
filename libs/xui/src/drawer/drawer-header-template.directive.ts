import { Directive, TemplateRef } from '@angular/core';
import { DrawerComponent } from './drawer.component';

@Directive({
  selector: '[xuiDrawerHeaderTemplate]',
  exportAs: 'xuiDrawerHeaderTemplate'
})
export class DrawerHeaderTemplateDirective {
  constructor(drawer: DrawerComponent, templateRef: TemplateRef<unknown>) {
    drawer.headerTemplate = templateRef;
  }
}
