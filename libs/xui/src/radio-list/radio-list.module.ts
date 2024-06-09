import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiRadioList } from './radio-list';
import { XuiRadioOption } from './radio-option';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiRadioList, XuiRadioOption],
  imports: [CommonModule, XuiIcon, XuiFocusModule],
  exports: [XuiRadioList, XuiRadioOption]
})
export class XuiRadioListModule {}
