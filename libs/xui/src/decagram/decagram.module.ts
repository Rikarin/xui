import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecagramComponent } from './decagram.component';
import { XuiIconModule } from '../icon';

@NgModule({
  imports: [CommonModule, XuiIconModule],
  declarations: [DecagramComponent],
  exports: [DecagramComponent]
})
export class XuiDecagramModule {}
