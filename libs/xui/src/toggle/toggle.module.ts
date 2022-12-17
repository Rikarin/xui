import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from './toggle.component';
import { XuiIconModule } from '../icon';

@NgModule({
  declarations: [ToggleComponent],

  exports: [ToggleComponent],
  imports: [CommonModule, XuiIconModule]
})
export class XuiToggleModule {}
