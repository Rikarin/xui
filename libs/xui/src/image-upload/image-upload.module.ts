import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiImageUpload } from './image-upload';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { DialogModule } from '@angular/cdk/dialog';
import { XuiButtonModule } from '../button';
import { TranslateModule } from '@ngx-translate/core';
import { XuiImageUploadCropper } from './image-upload-cropper';
import { XuiIcon } from '../icon';
import { XuiFocusModule } from '../utils/focus.service';

@NgModule({
  declarations: [XuiImageUpload, XuiImageUploadCropper],
  imports: [
    CommonModule,
    ImageCropperComponent,
    DialogModule,
    XuiIcon,
    XuiButtonModule,
    TranslateModule.forChild(),
    XuiFocusModule
  ],
  exports: [XuiImageUpload]
})
export class XuiImageUploadModule {}
