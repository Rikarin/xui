import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphViewComponent } from './graph-view.component';
import { NodeComponent } from './node.component';
import { XuiIconComponent } from '../icon';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [GraphViewComponent, NodeComponent],
  imports: [CommonModule, DragDropModule, XuiIconComponent],
  exports: [GraphViewComponent, NodeComponent]
})
export class XuiGraphViewModule {}
