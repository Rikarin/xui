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
import { CommonModule } from '@angular/common';
import { XuiIconComponent } from '../icon';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIconComponent],
  selector: 'xui-toggle',
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
  static ngAcceptInputType_value: BooleanInput;

  private onChange?: (source: boolean) => void;
  private onTouched?: () => void;
  private _value = true;

  @Input() @InputBoolean() disabled = false;
  @Input() color: ToggleColor = 'none';

  @Input()
  @InputBoolean()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
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

  constructor(private cdr: ChangeDetectorRef, @Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.cdr.markForCheck());
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

  @HostListener('focusout')
  private _focusOut() {
    this.onTouched?.();
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
