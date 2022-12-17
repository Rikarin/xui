import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from './popover.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopoverTriggerForDirective } from './popover-trigger-for.directive';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [PopoverComponent, PopoverTriggerForDirective],
  exports: [PopoverComponent, PopoverTriggerForDirective],
  imports: [CommonModule, OverlayModule, A11yModule]
})
export class XuiPopoverModule {}
