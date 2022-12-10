import { Directive, TemplateRef } from '@angular/core';
import { PanelBarComponent } from './panelbar.component';

@Directive({
  selector: '[xuiPanelBarItemTemplate]'
})
export class PanelBarItemTemplateDirective {
  constructor(panelBar: PanelBarComponent, templateRef: TemplateRef<any>) {
    panelBar.itemTemplate = templateRef;
  }
}
