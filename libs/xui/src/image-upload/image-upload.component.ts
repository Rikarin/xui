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
  ViewChild
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputBoolean, InputNumber } from '../utils';
import { XuiImageUploadCropperComponent } from './image-upload-cropper';
import { ImageUploadType } from './image-upload.types';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-image-upload',
  exportAs: 'xuiImageUpload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-upload.component.html'
})
export class XuiImageUploadComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: string | null) => void;
  private onTouched?: () => void;
  private _backgroundImage: string | null = null;
  private dialogRef?: DialogRef<unknown, XuiImageUploadCropperComponent>;

  touched = false;
  croppedImage: string | null = null;

  @Input() hoverLabel = 'xui.image_upload.change_image';
  @Input() type: ImageUploadType = 'square';
  @Input() @InputNumber() aspectRatio = 1;
  @Input() @InputBoolean() disabled = false;
  @ViewChild('input') inputElm!: ElementRef;

  get classes() {
    const ret: { [klass: string]: boolean } = {
      'x-image-upload': true,
      'x-image-upload-disabled': this.disabled,
      'x-image-upload-square': this.type === 'square'
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
    this.croppedImage = event.base64 ?? null;
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

  registerOnChange(onChange: (source: string | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
