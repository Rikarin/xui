import { Directive, TemplateRef } from '@angular/core';
import { XuiCardComponent } from './card.component';

@Directive({
  selector: '[xuiCardTitle]'
})
export class CardTitleDirective {
  constructor(card: XuiCardComponent, templateRef: TemplateRef<unknown>) {
    card.titleDirective = templateRef;
  }
}
