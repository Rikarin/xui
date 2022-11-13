import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  Self,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { InputGroupService } from './input-group.service';
import { InputBoolean } from '../utils';
import { InputColor, InputSize, InputType } from './input.types';

@Component({
  selector: 'xui-input',
  exportAs: 'xuiInput',
  styleUrls: ['input.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'input.component.html'
})
export class XuiInputComponent implements ControlValueAccessor, OnInit {
  _value?: string;
  touched = false;
  onChange = (source?: string) => {};
  onTouched = () => {};

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled: boolean = false;
  @Input() color: InputColor = 'light';
  @Input() size: InputSize = 'normal';
  @Input() type: InputType = 'text';
  @Input() dataList?: string[] | null;

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange(v);
      this.changeDetectorRef.markForCheck();
    }
  }

  get styles() {
    const ret: any = {
      input: true,
      'input-error': this.showError
    };

    ret[`input-color-${this.color}`] = true;
    ret[`input-${this.groupService?.size ?? this.size}`] = true;
    return ret;
  }

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translation: TranslateService,
    @Optional() private groupService: InputGroupService,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges!.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  get invalid(): boolean {
    return !!this.control?.invalid;
  }

  get showError(): boolean {
    if (!this.control) {
      return false;
    }

    const { dirty, touched } = this.control;
    return this.invalid ? dirty! || touched! : false;
  }

  writeValue(source: string) {
    this.value = source;
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
