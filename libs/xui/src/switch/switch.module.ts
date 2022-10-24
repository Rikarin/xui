import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiSwitchComponent } from './switch.component';
import { XuiIconModule } from '../icon';

@NgModule({
  declarations: [XuiSwitchComponent],
  imports: [CommonModule, XuiIconModule],
  exports: [XuiSwitchComponent]
})
export class XuiSwitchModule {}
