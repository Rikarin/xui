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
import { CheckboxColor } from './checkbox.types';

@Component({
  selector: 'xui-checkbox',
  exportAs: 'xuiCheckbox',
  styleUrls: ['checkbox.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div [ngClass]="styles">
    <div class="box" [class.checked]="value">
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
  private onChange?: (source?: boolean) => void;
  private onTouched?: () => void;
  _value = false;
  touched = false;

  @Input() @InputBoolean() disabled = false;
  @Input() color: CheckboxColor = 'primary';

  get styles() {
    const ret: { [klass: string]: boolean } = {
      checkbox: true,
      disabled: this.disabled
    };

    ret[`checkbox-color-${this.color}`] = true;
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
    this.control?.statusChanges?.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  writeValue(source: boolean) {
    this.value = source;
  }

  registerOnChange(onChange: (source?: boolean) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched?.();
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
