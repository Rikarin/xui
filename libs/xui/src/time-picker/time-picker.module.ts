import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiTimePickerComponent } from './time-picker.component';

@NgModule({
  declarations: [XuiTimePickerComponent],
  exports: [XuiTimePickerComponent],
  imports: [CommonModule]
})
export class XuiTimePickerModule {}
