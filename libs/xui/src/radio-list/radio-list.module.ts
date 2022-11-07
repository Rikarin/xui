import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiRadioListComponent } from './radio-list.component';
import { XuiIconModule } from '../icon';
import { XuiRadioOptionComponent } from './radio-option.component';

@NgModule({
  declarations: [XuiRadioListComponent, XuiRadioOptionComponent],
  imports: [CommonModule, XuiIconModule],
  exports: [XuiRadioListComponent, XuiRadioOptionComponent]
})
export class XuiRadioListModule {}
