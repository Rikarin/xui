import { Directive, TemplateRef } from '@angular/core';
import { XuiCard } from './card';

@Directive({
  selector: '[xuiCardTitle]',
  exportAs: 'xuiCardTitle'
})
export class XuiCardTitle {
  constructor(card: XuiCard, templateRef: TemplateRef<unknown>) {
    card.titleDirective = templateRef;
  }
}
