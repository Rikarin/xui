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
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputBoolean } from '../utils';
import { TranslateService } from '@ngx-translate/core';
import { InputGroupService } from '../input/input-group.service';

@Component({
  selector: 'xui-checkbox',
  exportAs: 'xuiCheckbox',
  styleUrls: ['checkbox.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.component.html'
})
export class XuiCheckboxComponent implements ControlValueAccessor, OnInit {
  _value = false;
  touched = false;
  onChange = (_?: boolean) => {};
  onTouched = () => {};

  @Input() @InputBoolean() disabled = false;
  // @Input() color: 'success' | 'warning' | 'info' | 'primary' | 'error' | string = 'success';

  get styles() {
    return {
      checkbox: true,
      disabled: this.disabled
    };
  }

  @Input()
  @InputBoolean()
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

  @HostListener('click')
  private _click() {
    if (!this.disabled) {
      this.value = !this.value;
    }
  }
}
