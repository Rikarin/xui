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
import { InputBoolean } from '../utils';
import { TranslateService } from '@ngx-translate/core';
import { InputGroupService } from '../input/input-group.service';

@Component({
  selector: 'xui-checkbox',
  exportAs: 'xuiCheckbox',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.component.html',
  host: {
    '[class.xui-checkbox-disabled]': 'disabled',
    '(click)': '_click()'
  }
})
export class XuiCheckboxComponent implements ControlValueAccessor, OnInit {
  _value = false;
  touched = false;
  onChange = (source?: boolean) => {};
  onTouched = () => {};

  @Input() @InputBoolean() disabled = false;
  @Input() color: 'success' | 'warning' | 'info' | 'primary' | 'error' | string = 'success';

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

  // get style() {
  //   return `xui-checkbox ${this.value ? 'xui-switch-enabled ' + 'xui-switch-' + this.color : ''}`;
  // }

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

  // get invalid(): boolean {
  //   return !!this.control?.invalid;
  // }

  // get showError(): boolean {
  //   if (!this.control) {
  //     return false;
  //   }
  //
  //   const { dirty, touched } = this.control;
  //   return this.invalid ? dirty! || touched! : false;
  // }

  writeValue(source: boolean) {
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

  _click() {
    if (!this.disabled) {
      this.value = !this.value;
    }
  }
}