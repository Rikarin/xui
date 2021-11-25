import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiButtonComponent } from './button.component';
import { XuiButtonGroupComponent } from './button-group.component';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiButtonComponent, XuiButtonGroupComponent],
  exports: [XuiButtonComponent, XuiButtonGroupComponent]
})
export class XuiButtonModule {}
