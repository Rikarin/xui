import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { XuiTooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [XuiTooltipDirective],
  imports: [CommonModule, MatTooltipModule, TranslateModule.forChild()],
  exports: [XuiTooltipDirective]
})
export class XuiTooltipModule {}
