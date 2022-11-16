import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecagramExample1Component } from './decagram-example1/decagram-example1.component';
import { XuiDecagramModule } from 'xui';

@NgModule({
  declarations: [DecagramExample1Component],
  exports: [DecagramExample1Component],
  imports: [CommonModule, XuiDecagramModule]
})
export class ExamplesModule {}
