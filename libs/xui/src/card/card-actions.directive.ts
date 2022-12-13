import { Directive, TemplateRef } from '@angular/core';
import { XuiCardComponent } from './card.component';

@Directive({
  selector: '[xuiCardActions]'
})
export class CardActionsDirective {
  constructor(card: XuiCardComponent, templateRef: TemplateRef<any>) {
    card.actionsDirective = templateRef;
  }
}
