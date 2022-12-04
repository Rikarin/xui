import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputBoolean } from '../utils';
import { ToggleColor } from './toggle.types';

@Component({
  selector: 'xui-toggle',
  exportAs: 'xuiToggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="style" [tabindex]="disabled ? -1 : 0">
      <div [class.x-toggle-clip]="!value">
        <div class="x-toggle-content">
          <xui-icon><ng-content></ng-content></xui-icon>
        </div>
      </div>
      <div [class.x-toggle-toggled]="!value">
        <div class="x-toggle-line"></div>
      </div>
    </div>
  `
})
export class XuiToggleComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: boolean) => void;
  private onTouched?: () => void;

  private _value = true;
  touched = false;

  @Input() @InputBoolean() disabled = false;
  @Input() color: ToggleColor = 'none';

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
      this.changeDetectorRef.markForCheck();
    }
  }

  get style() {
    const ret: { [klass: string]: boolean } = {
      'x-toggle': true,
      'x-toggle-disabled': this.disabled
    };

    ret[`x-toggle-${this.color}`] = this.color !== 'none';
    return ret;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, @Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  writeValue(source: boolean) {
    this.value = source;
  }

  registerOnChange(onChange: (source: boolean) => void) {
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

  @HostListener('click', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  _click(event?: KeyboardEvent | MouseEvent) {
    event?.preventDefault();

    if (!this.disabled) {
      this.value = !this.value;
    }
  }
}
