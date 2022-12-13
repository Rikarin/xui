import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiPopoverComponent } from './popover.component';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [XuiPopoverComponent],
  exports: [XuiPopoverComponent],
  imports: [CommonModule, OverlayModule]
})
export class XuiPopoverModule {}
