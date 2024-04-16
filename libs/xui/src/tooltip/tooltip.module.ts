import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipDirective } from './tooltip.directive';
import { TooltipComponent } from './tooltip.component';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [TooltipDirective, TooltipComponent],
  imports: [CommonModule, OverlayModule, TranslateModule.forChild()],
  exports: [TooltipDirective]
})
export class XuiTooltipModule {}
