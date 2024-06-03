import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiPopover } from './popover';
import { OverlayModule } from '@angular/cdk/overlay';
import { XuiPopoverTriggerFor } from './popover-trigger-for';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [XuiPopover, XuiPopoverTriggerFor],
  exports: [XuiPopover, XuiPopoverTriggerFor],
  imports: [CommonModule, OverlayModule, A11yModule]
})
export class XuiPopoverModule {}
