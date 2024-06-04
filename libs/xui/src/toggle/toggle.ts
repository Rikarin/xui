import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
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
import { XuiIcon } from '../icon';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon],
  selector: 'xui-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class.x-toggle-clip]="!value">
      <div class="x-toggle-content">
        <xui-icon [icon]="icon"></xui-icon>
      </div>
    </div>
    <div [class.x-toggle-toggled]="!value">
      <div class="x-toggle-line"></div>
    </div>`
})
export class XuiToggle implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_value: BooleanInput;

  private onChange?: (source: boolean) => void;
  private onTouched?: () => void;
  private _value = true;

  @Input() @InputBoolean() disabled = false;
  @Input() color: ToggleColor = 'none';
  @Input() icon!: string;

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

  @HostBinding('class.x-toggle')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-toggle-disabled')
  get hostDisabledClass(): boolean {
    return this.disabled;
  }

  @HostBinding('class')
  get hostClass(): string {
    return this.color !== 'none' ? `x-toggle-${this.color}` : '';
  }

  @HostBinding('tabindex')
  get hostTabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    @Self() @Optional() public control?: NgControl
  ) {
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
