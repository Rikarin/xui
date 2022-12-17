import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'xui-image-upload-cropper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="x-image-upload-cropper">
      <image-cropper
        [imageChangedEvent]="data.imageChangedEvent"
        [maintainAspectRatio]="true"
        [aspectRatio]="data.aspectRatio"
        format="webp"
        [roundCropper]="data.type === 'round'"
        (imageCropped)="data.imageCropped($event)"
      ></image-cropper>
    </div>
    <div class="x-image-upload-cropper-actions">
      <xui-button type="raised" (click)="data.save()">{{ 'xui.image_upload.save' | translate }}</xui-button>
    </div>
  `
})
export class ImageUploadCropperComponent {
  constructor(@Inject(DIALOG_DATA) public data: any) {}
}
