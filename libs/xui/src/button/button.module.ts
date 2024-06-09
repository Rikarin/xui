import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiButton } from './button';
import { XuiButtonGroup } from './button-group';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  imports: [CommonModule, XuiFocusModule],
  declarations: [XuiButton, XuiButtonGroup],
  exports: [XuiButton, XuiButtonGroup]
})
export class XuiButtonModule {}
