import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiCardComponent } from './card.component';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  imports: [CommonModule, PortalModule],
  declarations: [XuiCardComponent],
  exports: [XuiCardComponent],
})
export class XuiCardModule {}
