import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiIconComponent } from './icon.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [CommonModule, MatIconModule],
  declarations: [XuiIconComponent],
  exports: [XuiIconComponent]
})
export class XuiIconModule {}
