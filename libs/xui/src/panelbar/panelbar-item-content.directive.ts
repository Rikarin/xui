import { Directive, TemplateRef } from '@angular/core';
import { PanelBarItemComponent } from './panelbar-item.component';

@Directive({
  selector: '[xuiPanelBarItemContent]'
})
export class PanelBarItemContentDirective {
  constructor(panelBarItem: PanelBarItemComponent, templateRef: TemplateRef<unknown>) {
    panelBarItem.contentDirective = templateRef;
  }
}
