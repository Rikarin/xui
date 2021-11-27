import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiTooltipDirective, XuiTooltipComponent } from './tooltip.directive';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  imports: [CommonModule, OverlayModule],
  declarations: [XuiTooltipDirective, XuiTooltipComponent],
  exports: [XuiTooltipDirective, XuiTooltipComponent]
})
export class XuiTooltipModule {}
