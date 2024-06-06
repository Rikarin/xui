import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiRadio } from './radio';
import { XuiRadioGroup } from './radio-group';
import { TranslateModule } from '@ngx-translate/core';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiRadio, XuiRadioGroup],
  imports: [CommonModule, XuiIcon, TranslateModule.forChild(), XuiFocusModule],
  exports: [XuiRadio, XuiRadioGroup]
})
export class XuiRadioModule {}
