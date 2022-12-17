import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DialogModule } from '@angular/cdk/dialog';
import { XuiIconModule } from '../icon';
import { XuiButtonModule } from '../button';
import { TranslateModule } from '@ngx-translate/core';
import { ImageUploadCropperComponent } from './image-upload-cropper';

@NgModule({
  declarations: [ImageUploadComponent, ImageUploadCropperComponent],
  imports: [CommonModule, ImageCropperModule, DialogModule, XuiIconModule, XuiButtonModule, TranslateModule.forChild()],
  exports: [ImageUploadComponent]
})
export class XuiImageUploadModule {}
