import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiDecagramComponent } from './decagram.component';
import { XuiIconModule } from '../icon';

@NgModule({
  imports: [CommonModule, XuiIconModule],
  declarations: [XuiDecagramComponent],
  exports: [XuiDecagramComponent]
})
export class XuiDecagramModule {}
