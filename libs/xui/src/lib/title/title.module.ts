import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiTitleComponent } from './title.component';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [CommonModule, MatSelectModule, MatSlideToggleModule],
  declarations: [XuiTitleComponent],
})
export class TitleModule {}
