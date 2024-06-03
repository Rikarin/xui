import { Directive, TemplateRef } from '@angular/core';
import { XuiCard } from './card';

@Directive({
  selector: '[xuiCardActions]',
  exportAs: 'xuiCardActions'
})
export class XuiCardActions {
  constructor(card: XuiCard, templateRef: TemplateRef<unknown>) {
    card.actionsDirective = templateRef;
  }
}
