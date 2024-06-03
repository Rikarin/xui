import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiRadio } from './radio';
import { XuiRadioGroup } from './radio-group';
import { TranslateModule } from '@ngx-translate/core';
import { XuiIcon } from '../icon';

@NgModule({
  declarations: [XuiRadio, XuiRadioGroup],
  imports: [CommonModule, XuiIcon, TranslateModule.forChild()],
  exports: [XuiRadio, XuiRadioGroup]
})
export class XuiRadioModule {}
