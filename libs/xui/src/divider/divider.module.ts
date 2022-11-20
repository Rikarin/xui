import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiDividerComponent } from './divider.component';

@NgModule({
  declarations: [XuiDividerComponent],
  exports: [XuiDividerComponent],
  imports: [CommonModule]
})
export class XuiDividerModule {}
