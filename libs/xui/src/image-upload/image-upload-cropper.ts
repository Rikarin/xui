import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'xui-image-upload-cropper',
  exportAs: 'xuiImageUploadCropper',
  styleUrls: ['image-upload-cropper.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cropper">
      <image-cropper
        [imageChangedEvent]="data.imageChangedEvent"
        [maintainAspectRatio]="true"
        [aspectRatio]="data.aspectRatio"
        format="webp"
        [roundCropper]="data.type === 'round'"
        (imageCropped)="data.imageCropped($event)"
      ></image-cropper>
    </div>
    <div class="actions">
      <xui-button type="raised" (click)="data.save()">{{ 'xui.image_upload.save' | translate }}</xui-button>
    </div>
  `
})
export class XuiImageUploadCropperComponent {
  constructor(@Inject(DIALOG_DATA) public data: any) {}
}
