import { Directive, TemplateRef } from '@angular/core';
import { XuiPanelBarItem } from './panelbar-item';

@Directive({
  selector: '[xuiPanelBarItemTitle]',
  exportAs: 'xuiPanelBarItemTitle'
})
export class XuiPanelBarItemTitle {
  constructor(panelBarItem: XuiPanelBarItem, templateRef: TemplateRef<unknown>) {
    panelBarItem._titleDirective = templateRef;
  }
}
