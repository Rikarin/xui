import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiPopoverComponent } from './popover.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopoverTriggerForDirective } from './popover-trigger-for.directive';

@NgModule({
  declarations: [XuiPopoverComponent, PopoverTriggerForDirective],
  exports: [XuiPopoverComponent, PopoverTriggerForDirective],
  imports: [CommonModule, OverlayModule]
})
export class XuiPopoverModule {}
