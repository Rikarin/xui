import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioListComponent } from './radio-list.component';
import { RadioOptionComponent } from './radio-option.component';
import { XuiIconComponent } from '../icon';

@NgModule({
  declarations: [RadioListComponent, RadioOptionComponent],
  imports: [CommonModule, XuiIconComponent],
  exports: [RadioListComponent, RadioOptionComponent]
})
export class XuiRadioListModule {}
