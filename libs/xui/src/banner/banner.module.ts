import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './banner.component';
import { XuiIconModule } from '../icon';

@NgModule({
  imports: [CommonModule, XuiIconModule],
  declarations: [BannerComponent],
  exports: [BannerComponent]
})
export class XuiBannerModule {}
