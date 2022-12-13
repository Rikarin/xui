import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiPopoverComponent } from './popover.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopoverTriggerForDirective } from './popover-trigger-for.directive';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [XuiPopoverComponent, PopoverTriggerForDirective],
  exports: [XuiPopoverComponent, PopoverTriggerForDirective],
  imports: [CommonModule, OverlayModule, A11yModule]
})
export class XuiPopoverModule {}
