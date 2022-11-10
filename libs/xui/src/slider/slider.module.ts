import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XuiSliderComponent } from './slider.component';
import { XuiTooltipModule } from '../tooltip';

@NgModule({
  imports: [CommonModule, FormsModule, XuiTooltipModule],
  declarations: [XuiSliderComponent],
  exports: [XuiSliderComponent]
})
export class XuiSliderModule {}
