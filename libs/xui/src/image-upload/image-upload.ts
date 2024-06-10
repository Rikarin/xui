import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  Optional,
  Self,
  signal,
  ViewChild
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { XuiImageUploadCropper } from './image-upload-cropper';
import { ImageUploadType } from './image-upload.types';

@Component({
  selector: 'xui-image-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'image-upload.html',
  host: {
    class: 'x-image-upload',
    '[class.x-image-upload-disabled]': 'disabled()',
    '[class.x-image-upload-square]': 'type() === "square"',
    '[style.border-radius.%]': '_borderRadius()',
    '[style.aspect-ratio]': 'aspectRatio()',
    '[style.background-image]': '_backgroundImageUrl()',
    '[tabindex]': '_disabled() ? -1 : 0',
    '(focusout)': '_onTouched?.()',
    '(keydown.enter)': '_keyPress($event)',
    '(keydown.space)': '_keyPress($event)'
  }
})
export class XuiImageUpload implements ControlValueAccessor {
  private dialogRef?: DialogRef<unknown, XuiImageUploadCropper>;
  private croppedImage: string | null = null;
  private onChange?: (source: string | null) => void;
  _onTouched?: () => void;
  _disabled = signal(false);

  value = model<string | null>(null);
  type = input<ImageUploadType>('square');
  aspectRatio = input(1);
  hoverLabel = input('xui.image_upload.change_image');
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });

  _borderRadius = computed(() => (this.type() === 'round' ? 50 : 4));
  _backgroundImageUrl = computed(() => (this.value() ? `url(${this.value()})` : null));

  @ViewChild('input') private inputElm!: ElementRef;

  constructor(
    private dialog: Dialog,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
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

  _keyPress(event: KeyboardEvent) {
    event?.preventDefault();
    this.inputElm.nativeElement.click();
  }

  private imageCropped = (event: ImageCroppedEvent) => {
    this.croppedImage = event.base64 ?? null;
  };

  private save = () => {
    this.onChange?.(this.croppedImage);
    this.value.set(this.croppedImage);
    this.dialogRef?.close();
  };

  writeValue(source: string) {
    this.croppedImage = source;
    this.value.set(source);
  }

  registerOnChange(onChange: (source: string | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this._onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
