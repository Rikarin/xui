import { Directive, TemplateRef } from '@angular/core';
import { XuiPanelBarItem } from './panelbar-item';

@Directive({
  selector: '[xuiPanelBarItemContent]',
  exportAs: 'xuiPanelBarItemContent'
})
export class XuiPanelBarItemContent {
  constructor(panelBarItem: XuiPanelBarItem, templateRef: TemplateRef<unknown>) {
    panelBarItem._contentDirective = templateRef;
  }
}
