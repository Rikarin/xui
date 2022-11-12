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
import { InputBoolean } from '../utils';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputGroupService } from '../input/input-group.service';

@Component({
  selector: 'xui-switch',
  exportAs: 'xuiSwitch',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.component.html',
  host: {
    '[class.xui-switch-disabled]': 'disabled',
    '(click)': '_click()',
    '[tabindex]': 'disabled ? -1 : 0'
  }
})
export class XuiSwitchComponent implements ControlValueAccessor, OnInit {
  _value = false;
  touched = false;
  onChange = (source?: boolean) => {};
  onTouched = () => {};

  @Input() @InputBoolean() disabled = false;
  @Input() color: 'success' | 'info' | 'error' | string = 'success';

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

  get style() {
    return `xui-switch ${this.value ? 'xui-switch-enabled ' + 'xui-switch-' + this.color : ''}`;
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
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
