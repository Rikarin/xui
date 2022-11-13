import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self,
  ViewEncapsulation
} from '@angular/core';
import { InputBoolean } from '../utils';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputGroupService } from '../input/input-group.service';
import { SwitchColor } from './switch.types';

@Component({
  selector: 'xui-switch',
  exportAs: 'xuiSwitch',
  styleUrls: ['switch.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.component.html'
})
export class XuiSwitchComponent implements ControlValueAccessor, OnInit {
  _value = false;
  touched = false;
  onChange = (source?: boolean) => {};
  onTouched = () => {};

  @Input() @InputBoolean() disabled = false;
  @Input() color: SwitchColor = 'success';

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
    return {
      content: true,
      disabled: this.disabled
    };
  }

  get styleSwitch() {
    const ret: any = {
      switch: true,
      enabled: this.value
    };

    ret[`color-${this.color}`] = this.value;
    return ret;
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

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  _click(event?: any) {
    event?.preventDefault();

    if (!this.disabled) {
      this.value = !this.value;
    }
  }
}
