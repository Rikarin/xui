import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiProgressComponent } from './progress.component';
import { XuiDecagramModule } from '../decagram';

@NgModule({
  declarations: [XuiProgressComponent],
  imports: [CommonModule, XuiDecagramModule],
  exports: [XuiProgressComponent]
})
export class XuiProgressModule {}
