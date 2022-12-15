import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputBoolean } from '../utils';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SelectColor, SelectItem, SelectSize } from './select.types';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'xui-select',
  exportAs: 'xuiSelect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'select.component.html'
})
export class XuiSelectComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: string | number | null) => void;
  private onTouched?: () => void;
  private _value: string | number | null = null;
  private _viewValue?: string;
  isOpen = false;
  onChange$ = new Subject();

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled = false;
  @Input() color: SelectColor = 'light';
  @Input() size: SelectSize = 'large';
  @Input() items?: SelectItem[];

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
      this.onChange$.next(null);
    }
  }

  get width() {
    return this.elementRef.nativeElement.offsetWidth;
  }

  get viewValue() {
    const item = this.items?.find(x => x.value === this.value);
    return item?.label ?? this._viewValue;
  }

  set viewValue(value: string | undefined) {
    this._viewValue = value;
    this.changeDetectorRef.detectChanges();
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-select': true,
      'x-select-disabled': this.disabled
    };

    ret[`x-select-${this.color}`] = true;
    ret[`x-select-${this.size}`] = true;
    return ret;
  }

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  open() {
    this.isOpen = !this.disabled;
    this.changeDetectorRef.markForCheck();
  }

  close() {
    this.isOpen = false;
    this.changeDetectorRef.markForCheck();
  }

  writeValue(source: string) {
    this.value = source;
  }

  registerOnChange(onChange: (source: string | number | null) => void) {
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
}
