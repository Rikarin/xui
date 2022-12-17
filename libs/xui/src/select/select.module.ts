import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from './select.component';
import { XuiIconModule } from '../icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { OptionComponent } from './option.component';
import { XuiDecagramModule } from '../decagram';

@NgModule({
  imports: [CommonModule, FormsModule, OverlayModule, XuiIconModule, XuiDecagramModule, TranslateModule.forChild()],
  declarations: [SelectComponent, OptionComponent],
  exports: [SelectComponent, OptionComponent]
})
export class XuiSelectModule {}
