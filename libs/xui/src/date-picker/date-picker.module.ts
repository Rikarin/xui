import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiDatePickerComponent } from './date-picker.component';
import { XuiIconModule } from '../icon';
import { XuiInputModule } from '../input';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [XuiDatePickerComponent],
  exports: [XuiDatePickerComponent],
  imports: [CommonModule, XuiIconModule, XuiInputModule, OverlayModule, A11yModule, ReactiveFormsModule]
})
export class XuiDatePickerModule {}
