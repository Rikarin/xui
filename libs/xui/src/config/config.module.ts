import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiConfigure } from './configure';

@NgModule({
  declarations: [XuiConfigure],
  exports: [XuiConfigure],
  imports: [CommonModule]
})
export class XuiConfigModule {}
