import { Directive, TemplateRef } from '@angular/core';
import { DrawerComponent } from './drawer.component';

@Directive({
  selector: '[xuiDrawerItemTemplate]',
  exportAs: 'xuiDrawerItemTemplate'
})
export class DrawerItemTemplateDirective {
  constructor(drawer: DrawerComponent, templateRef: TemplateRef<unknown>) {
    drawer.itemTemplate = templateRef;
  }
}
