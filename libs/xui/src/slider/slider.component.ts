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
import { InputBoolean } from '../utils';

@Component({
  selector: 'xui-slider',
  exportAs: 'xuiSlider',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'slider.component.html'
})
export class XuiSliderComponent implements ControlValueAccessor, OnInit {
  _value?: string;
  touched = false;
  onChange = (source?: string) => {};
  onTouched = () => {};

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled: boolean = false;
  @Input() color: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'warning' | 'success' | 'minimal' | string =
    'primary';
  @Input() secondColor?: 'primary' | 'primary-alt' | 'secondary' | 'error' | 'success' | 'minimal' | string;
  @Input() size: 'normal' | 'small' = 'normal';
  @Input() dataList?: string[] | null;
  @Input() type: 'text' | 'password' | 'color' | 'date' | 'email' | 'number' = 'text';

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

  get tooltip() {
    return '42 %';
  }

  // get styles() {
  //   return `xui-input xui-input-${this.color} xui-input-${this.size}`;
  // }

  getColor(color: string) {
    return `xui-slider-color-${color}`;
  }

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translation: TranslateService,
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
