import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'xui-image-upload',
  exportAs: 'xuiImageUpload',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: XuiImageUploadComponent
    }
  ],
  host: {
    '[class.xui-image-upload-square]': 'type === "square"',
    '[style.border-radius.%]': 'borderRadius',
    '[style.aspect-ratio]': 'aspectRatio',
    '[style.background-image]': 'backgroundImage'
  }
})
export class XuiImageUploadComponent implements ControlValueAccessor {
  private _backgroundImage?: string;
  private dialogRef?: DialogRef<any>;

  touched = false;
  imageChangedEvent = '';
  croppedImage?: string = '';

  onChange = (source?: string) => {};
  onTouched = () => {};

  @Input() hoverLabel?: string = 'change image';
  @Input() type: 'square' | 'round' = 'square';
  @Input() aspectRatio = 1;
  @ViewChild('cropper') cropper!: TemplateRef<any>;

  get backgroundImage() {
    return this._backgroundImage ? `url(${this._backgroundImage})` : null;
  }

  get borderRadius() {
    return this.type === 'round' ? 50 : 4;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, private dialog: Dialog) {}

  handleFileInput(event: any) {
    this.imageChangedEvent = event;
    this.dialogRef = this.dialog.open(this.cropper);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 ?? undefined;
  }

  async save() {
    this.onChange(this.croppedImage);
    this._backgroundImage = this.croppedImage;
    this.dialogRef?.close();
    this.changeDetectorRef.markForCheck();
  }

  writeValue(source: string) {
    this.croppedImage = source;
    this._backgroundImage = source;
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
