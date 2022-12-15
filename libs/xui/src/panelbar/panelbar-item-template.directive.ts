import { Directive, TemplateRef } from '@angular/core';
import { PanelBarService } from './panelbar.service';

@Directive({
  selector: '[xuiPanelBarItemTemplate]'
})
export class PanelBarItemTemplateDirective {
  constructor(panelBar: PanelBarService, templateRef: TemplateRef<unknown>) {
    panelBar.itemTemplate = templateRef;
  }
}
