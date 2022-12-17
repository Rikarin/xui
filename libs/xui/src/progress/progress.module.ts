import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressComponent } from './progress.component';
import { XuiDecagramModule } from '../decagram';

@NgModule({
  declarations: [ProgressComponent],
  imports: [CommonModule, XuiDecagramModule],
  exports: [ProgressComponent]
})
export class XuiProgressModule {}
