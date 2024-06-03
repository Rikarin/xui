import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { XuiTooltip } from './tooltip.directive';
import { Tooltip } from './tooltip';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [XuiTooltip, Tooltip],
  imports: [CommonModule, OverlayModule, TranslateModule.forChild()],
  exports: [XuiTooltip]
})
export class XuiTooltipModule {}
