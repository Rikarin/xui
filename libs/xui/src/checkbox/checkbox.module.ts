import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiCheckboxComponent } from './checkbox.component';
import { XuiIconModule } from '../icon';

@NgModule({
  declarations: [XuiCheckboxComponent],
  imports: [CommonModule, XuiIconModule],
  exports: [XuiCheckboxComponent]
})
export class XuiCheckboxModule {}
