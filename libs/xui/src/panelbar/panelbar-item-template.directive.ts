import { Directive, Inject, TemplateRef } from '@angular/core';
import { PANEL_BAR_ACCESSOR, PanelBarAccessor } from './panelbar.types';

@Directive({
  selector: '[xuiPanelBarItemTemplate]',
  exportAs: 'xuiPanelBarItemTemplate'
})
export class PanelBarItemTemplateDirective {
  constructor(@Inject(PANEL_BAR_ACCESSOR) panelBar: PanelBarAccessor, templateRef: TemplateRef<unknown>) {
    panelBar.itemTemplate = templateRef;
  }
}
