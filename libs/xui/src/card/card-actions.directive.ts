import { Directive, TemplateRef } from '@angular/core';
import { CardComponent } from './card.component';

@Directive({
  selector: '[xuiCardActions]',
  exportAs: 'xuiCardActions'
})
export class CardActionsDirective {
  constructor(card: CardComponent, templateRef: TemplateRef<unknown>) {
    card.actionsDirective = templateRef;
  }
}
