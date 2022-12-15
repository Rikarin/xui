import { Directive, TemplateRef } from '@angular/core';
import { XuiCardComponent } from './card.component';

@Directive({
  selector: '[xuiCardActions]'
})
export class CardActionsDirective {
  constructor(card: XuiCardComponent, templateRef: TemplateRef<unknown>) {
    card.actionsDirective = templateRef;
  }
}
