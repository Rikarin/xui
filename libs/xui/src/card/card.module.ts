import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';
import { PortalModule } from '@angular/cdk/portal';
import { CardActionsDirective } from './card-actions.directive';
import { CardTitleDirective } from './card-title.directive';

@NgModule({
  imports: [CommonModule, PortalModule],
  declarations: [CardComponent, CardActionsDirective, CardTitleDirective],
  exports: [CardComponent, CardActionsDirective, CardTitleDirective]
})
export class XuiCardModule {}
