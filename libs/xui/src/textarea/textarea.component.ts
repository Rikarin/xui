import { BooleanInput } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InputBoolean, InputNumber } from '../utils';
import { TextareaColor, TextareaSize } from './textarea.types';

@Component({
  selector: 'xui-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'textarea.component.html'
})
export class TextareaComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: string | null) => void;
  private onTouched?: () => void;

  _value: string | null = null;
  touched = false;

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled = false;
  @Input() color: TextareaColor = 'light';
  @Input() size: TextareaSize = 'normal';
  @Input() @InputNumber() rows = 3;
  @Input() @InputNumber() maxLength?: number;

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
      this.cdr.markForCheck();
    }
  }

  get wordCount() {
    return (this.maxLength ?? 0) - (this.value?.length ?? 0);
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-textarea': true,
      'x-textarea-disabled': this.disabled
    };

    ret[`x-textarea-${this.color}`] = true;
    return ret;
  }

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private translation: TranslateService,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.cdr.markForCheck());
  }

  get invalid(): boolean {
    return !!this.control?.invalid;
  }

  get showError(): boolean {
    if (!this.control) {
      return false;
    }

    const { dirty, touched } = this.control;
    return this.invalid ? (dirty ?? false) || (touched ?? false) : false;
  }

  writeValue(source: string) {
    this.value = source;
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

  markAsTouched() {
    if (!this.touched) {
      this.onTouched?.();
      this.touched = true;
    }
  }
}
