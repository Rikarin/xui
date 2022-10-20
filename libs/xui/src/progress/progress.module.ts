import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiProgressComponent } from './progress.component';
import { XuiIconModule } from '../icon';

@NgModule({
  declarations: [XuiProgressComponent],
  imports: [CommonModule, XuiIconModule],
  exports: [XuiProgressComponent]
})
export class XuiProgressModule {}
