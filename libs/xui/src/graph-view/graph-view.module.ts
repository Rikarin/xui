import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiGraphView } from './graph-view';
import { XuiNode } from './node';
import { XuiIcon } from '../icon';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [XuiGraphView, XuiNode],
  imports: [CommonModule, DragDropModule, XuiIcon],
  exports: [XuiGraphView, XuiNode]
})
export class XuiGraphViewModule {}
