import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderComponent } from './slider.component';
import { XuiTooltipModule } from '../tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [CommonModule, FormsModule, XuiTooltipModule, DragDropModule],
  declarations: [SliderComponent],
  exports: [SliderComponent]
})
export class XuiSliderModule {}
