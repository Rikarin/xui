import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioListComponent } from './radio-list.component';
import { XuiIconModule } from '../icon';
import { RadioOptionComponent } from './radio-option.component';

@NgModule({
  declarations: [RadioListComponent, RadioOptionComponent],
  imports: [CommonModule, XuiIconModule],
  exports: [RadioListComponent, RadioOptionComponent]
})
export class XuiRadioListModule {}
