import { Directive, TemplateRef } from '@angular/core';
import { CardComponent } from './card.component';

@Directive({
  selector: '[xuiCardTitle]',
  exportAs: 'xuiCardTitle'
})
export class CardTitleDirective {
  constructor(card: CardComponent, templateRef: TemplateRef<unknown>) {
    card.titleDirective = templateRef;
  }
}
