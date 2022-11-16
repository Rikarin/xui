import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputNumber } from '../utils';
import { XuiImageUploadCropperComponent } from './image-upload-cropper';
import { ImageUploadType } from './image-upload.types';

@Component({
  selector: 'xui-image-upload',
  exportAs: 'xuiImageUpload',
  styleUrls: ['image-upload.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload.component.html'
})
export class XuiImageUploadComponent implements ControlValueAccessor, OnInit {
  private onChange?: (source?: string) => void;
  private onTouched?: () => void;
  private _backgroundImage?: string;
  private dialogRef?: DialogRef<unknown, XuiImageUploadCropperComponent>;

  touched = false;
  croppedImage?: string = '';

  @Input() hoverLabel = 'xui.image_upload.change_image';
  @Input() type: ImageUploadType = 'square';
  @Input() @InputNumber() aspectRatio = 1;
  @ViewChild('input') inputElm!: ElementRef;

  get classes() {
    const ret: { [klass: string]: boolean } = {
      'image-upload': true,
      'upload-square': this.type === 'square'
    };

    return ret;
  }

  get styles() {
    return {
      'border-radius.%': this.borderRadius,
      'aspect-ratio': this.aspectRatio,
      'background-image': this.backgroundImage
    };
  }

  get backgroundImage() {
    return this._backgroundImage ? `url(${this._backgroundImage})` : null;
  }

  get borderRadius() {
    return this.type === 'round' ? 50 : 4;
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: Dialog,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  handleFileInput(event: unknown) {
    this.dialogRef = this.dialog.open(XuiImageUploadCropperComponent, {
      data: {
        type: this.type,
        aspectRatio: this.aspectRatio,
        save: this.save,
        imageChangedEvent: event,
        imageCropped: this.imageCropped
      }
    });
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  private _keyPress(event: KeyboardEvent) {
    event?.preventDefault();
    this.inputElm.nativeElement.click();
  }

  imageCropped = (event: ImageCroppedEvent) => {
    this.croppedImage = event.base64 ?? undefined;
  };

  save = () => {
    this.onChange?.(this.croppedImage);
    this._backgroundImage = this.croppedImage;
    this.dialogRef?.close();
    this.changeDetectorRef.markForCheck();
  };

  writeValue(source: string) {
    this.croppedImage = source;
    this._backgroundImage = source;
  }

  registerOnChange(onChange: (source?: string) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched?.();
      this.touched = true;
    }
  }
}
