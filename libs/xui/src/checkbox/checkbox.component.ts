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
import { CheckboxColor } from './checkbox.types';
import { BooleanInput } from '@angular/cdk/coercion';
import { CHECKBOX_MODULE, WithConfig, XuiConfigService } from '../config';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'xui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div [ngClass]="styles">
    <div class="x-checkbox-box" tabindex="0" [class.x-checkbox-checked]="value">
      <svg
        *ngIf="value"
        viewBox="0 0 24 24"
        height="100%"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path>
      </svg>
    </div>
    <ng-content></ng-content>
  </div>`
})
export class XuiCheckboxComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_value: BooleanInput;
  private readonly _moduleName = CHECKBOX_MODULE;

  private onChange?: (source: boolean) => void;
  private onTouched?: () => void;
  private _value = false;

  @Input() @InputBoolean() @WithConfig() disabled = false;
  @Input() @WithConfig() color: CheckboxColor = 'primary';

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-checkbox': true,
      'x-checkbox-disabled': this.disabled
    };

    ret[`x-checkbox-${this.color}`] = true;
    return ret;
  }

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

  constructor(
    private configService: XuiConfigService,
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

  @HostListener('click')
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  private _click(event: KeyboardEvent) {
    event?.preventDefault();

    if (!this.disabled) {
      this.value = !this.value;
    }
  }
}
