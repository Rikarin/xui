import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipDirective } from './tooltip.directive';
import { TooltipComponent } from './tooltip.component';

@NgModule({
  declarations: [TooltipDirective, TooltipComponent],
  imports: [CommonModule, MatTooltipModule, TranslateModule.forChild()],
  exports: [TooltipDirective]
})
export class XuiTooltipModule {}
