import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XuiSliderComponent } from './slider.component';
import { XuiTooltipModule } from '../tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [CommonModule, FormsModule, XuiTooltipModule, DragDropModule],
  declarations: [XuiSliderComponent],
  exports: [XuiSliderComponent]
})
export class XuiSliderModule {}
