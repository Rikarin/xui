import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiCard } from './card';
import { PortalModule } from '@angular/cdk/portal';
import { XuiCardActions } from './card-actions';
import { XuiCardTitle } from './card-title';

@NgModule({
  imports: [CommonModule, PortalModule],
  declarations: [XuiCard, XuiCardActions, XuiCardTitle],
  exports: [XuiCard, XuiCardActions, XuiCardTitle]
})
export class XuiCardModule {}
