import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';
import { ButtonGroupComponent } from './button-group.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ButtonComponent, ButtonGroupComponent],
  exports: [ButtonComponent, ButtonGroupComponent]
})
export class XuiButtonModule {}
