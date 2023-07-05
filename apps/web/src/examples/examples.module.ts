import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecagramExample1Component } from './decagram-example1/decagram-example1.component';
import { XuiDecagramComponent } from '@xui/components';

@NgModule({
  declarations: [DecagramExample1Component],
  exports: [DecagramExample1Component],
  imports: [CommonModule, XuiDecagramComponent]
})
export class ExamplesModule {}
