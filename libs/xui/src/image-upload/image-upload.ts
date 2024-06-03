import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
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
import { XuiImageUploadCropper } from './image-upload-cropper';
import { ImageUploadType } from './image-upload.types';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-image-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'image-upload.html'
})
export class XuiImageUpload implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: string | null) => void;
  private onTouched?: () => void;
  private _backgroundImage: string | null = null;
  private dialogRef?: DialogRef<unknown, XuiImageUploadCropper>;
  private croppedImage: string | null = null;

  @Input() hoverLabel = 'xui.image_upload.change_image';
  @Input() type: ImageUploadType = 'square';
  @Input() @InputNumber() aspectRatio = 1;
  @Input() @InputBoolean() disabled = false;
  @ViewChild('input') inputElm!: ElementRef;

  @HostBinding('class.x-image-upload')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-image-upload-disabled')
  get hostDisabledClass(): boolean {
    return this.disabled;
  }

  @HostBinding('class.x-image-upload-square')
  get hostSquareClass(): boolean {
    return this.type === 'square';
  }

  @HostBinding('tabindex')
  get hostTabIndex(): number {
    return 0;
  }

  @HostBinding('style.border-radius.%')
  get hostBorderRadiusStyle(): number {
    return this.borderRadius;
  }

  @HostBinding('style.aspect-ratio')
  get hostAspectRatioStyle(): number {
    return this.aspectRatio;
  }

  @HostBinding('style.background-image')
  get hostBackgroundImageStyle(): string | null {
    return this.backgroundImage;
  }

  get backgroundImage() {
    return this._backgroundImage ? `url(${this._backgroundImage})` : null;
  }

  get borderRadius() {
    return this.type === 'round' ? 50 : 4;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: Dialog,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.cdr.markForCheck());
  }

  handleFileInput(event: unknown) {
    this.dialogRef = this.dialog.open(XuiImageUploadCropper, {
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
    this.cdr.markForCheck();
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

  @HostListener('focusout')
  private _focusOut() {
    this.onTouched?.();
  }
}
