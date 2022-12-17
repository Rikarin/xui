import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwitchComponent } from './switch.component';
import { XuiIconModule } from '../icon';

@NgModule({
  declarations: [SwitchComponent],
  imports: [CommonModule, XuiIconModule],
  exports: [SwitchComponent]
})
export class XuiSwitchModule {}
