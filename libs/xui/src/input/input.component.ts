import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InputBoolean } from '../utils';
import { INPUT_GROUP_ACCESSOR, InputColor, InputGroupAccessor, InputSize, InputType } from './input.types';
import { BooleanInput } from '@angular/cdk/coercion';
import { INPUT_MODULE, WithConfig, XuiConfigService } from '../config';

@Component({
  selector: 'xui-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'input.component.html'
})
export class InputComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_readOnly: BooleanInput;
  private readonly _moduleName = INPUT_MODULE;

  private onChange?: (source: string | null) => void;
  private onTouched?: () => void;
  private _value: string | null = null;

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled = false;
  @Input() @InputBoolean() readOnly = false;
  @Input() @WithConfig() color: InputColor = 'light';
  @Input() @WithConfig() size: InputSize = 'large';
  @Input() type: InputType = 'text';
  @Input() autocomplete?: string;
  @Input() dataList?: string[] | null;

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

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-input': true,
      'x-input-error': this.showError
    };

    ret[`x-input-${this.color}`] = true;
    ret[`x-input-${this.group?.size ?? this.size}`] = true;
    return ret;
  }

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private configService: XuiConfigService,
    private cdr: ChangeDetectorRef,
    private translation: TranslateService,
    @Inject(INPUT_GROUP_ACCESSOR) @Optional() private group: InputGroupAccessor,
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

  @HostListener('focusout')
  private _focusOut() {
    this.onTouched?.();
  }
}
