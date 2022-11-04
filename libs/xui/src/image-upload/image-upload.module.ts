import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiImageUploadComponent } from './image-upload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DialogModule } from '@angular/cdk/dialog';
import { XuiIconModule } from '../icon';
import { XuiButtonModule } from '../button';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [XuiImageUploadComponent],
  imports: [CommonModule, ImageCropperModule, DialogModule, XuiIconModule, XuiButtonModule, TranslateModule.forChild()],
  exports: [XuiImageUploadComponent]
})
export class XuiImageUploadModule {}
