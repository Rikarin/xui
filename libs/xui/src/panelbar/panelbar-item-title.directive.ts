import { Directive, TemplateRef } from '@angular/core';
import { PanelBarItemComponent } from './panelbar-item.component';

@Directive({
  selector: '[xuiPanelBarItemTitle]'
})
export class PanelBarItemTitleDirective {
  constructor(panelBarItem: PanelBarItemComponent, templateRef: TemplateRef<unknown>) {
    panelBarItem.titleDirective = templateRef;
  }
}
