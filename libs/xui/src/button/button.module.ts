import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiButton } from './button';
import { XuiButtonGroup } from './button-group';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiButton, XuiButtonGroup],
  exports: [XuiButton, XuiButtonGroup]
})
export class XuiButtonModule {}
