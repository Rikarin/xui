import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiDatePickerComponent } from './date-picker.component';

@NgModule({
  declarations: [XuiDatePickerComponent],
  exports: [XuiDatePickerComponent],
  imports: [CommonModule]
})
export class XuiDatePickerModule {}
