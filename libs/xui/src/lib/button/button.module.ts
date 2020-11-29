import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiButtonComponent } from './button.component';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiButtonComponent],
  exports: [XuiButtonComponent],
})
export class XuiButtonModule {}
