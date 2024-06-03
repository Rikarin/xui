import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiRadioList } from './radio-list';
import { XuiRadioOption } from './radio-option';
import { XuiIcon } from '../icon';

@NgModule({
  declarations: [XuiRadioList, XuiRadioOption],
  imports: [CommonModule, XuiIcon],
  exports: [XuiRadioList, XuiRadioOption]
})
export class XuiRadioListModule {}
