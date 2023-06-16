import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DialogModule } from '@angular/cdk/dialog';
import { XuiButtonModule } from '../button';
import { TranslateModule } from '@ngx-translate/core';
import { ImageUploadCropperComponent } from './image-upload-cropper';
import { XuiIconComponent } from '../icon';

@NgModule({
  declarations: [ImageUploadComponent, ImageUploadCropperComponent],
  imports: [
    CommonModule,
    ImageCropperModule,
    DialogModule,
    XuiIconComponent,
    XuiButtonModule,
    TranslateModule.forChild()
  ],
  exports: [ImageUploadComponent]
})
export class XuiImageUploadModule {}
