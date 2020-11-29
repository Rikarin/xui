import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiBannerComponent } from './banner.component';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiBannerComponent],
  exports: [XuiBannerComponent],
})
export class XuiBannerModule {}
