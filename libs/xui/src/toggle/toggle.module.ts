import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiToggleComponent } from './toggle.component';
import { XuiIconModule } from '../icon';

@NgModule({
  declarations: [XuiToggleComponent],

  exports: [XuiToggleComponent],
  imports: [CommonModule, XuiIconModule]
})
export class XuiToggleModule {}
