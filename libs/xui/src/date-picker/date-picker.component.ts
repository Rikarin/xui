import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  Optional,
  Self,
  ViewChild
} from '@angular/core';
import { DateTime } from 'luxon';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { InputBoolean } from '../utils';
import { InputComponent } from '../input';
import { BooleanInput } from '@angular/cdk/coercion';
import { DatePickerColor, DatePickerSize } from './date-picker.types';

@Component({
  selector: 'xui-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent implements ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_readOnly: BooleanInput;

  private onChange?: (source: string | null) => void;
  private onTouched?: () => void;
  private _value: DateTime | null = null;

  focus!: DateTime;
  indices = Array.from(Array(7 * 6)).map((x, i) => i);
  isOpen = false;
  isFocus = false;
  mouseDown = false;

  @Input() allowClear?: boolean; // TODO
  @Input() disabledDate?: (current: DateTime) => boolean;
  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled = false;
  @Input() @InputBoolean() readOnly = false;
  @Input() color: DatePickerColor = 'light';
  @Input() size: DatePickerSize = 'large';

  @ViewChild(InputComponent, { static: true }) input!: InputComponent;

  @Input()
  get value() {
    return this._value?.toISODate() ?? null;
  }

  set value(v) {
    if (!v) {
      this._value = null;
      this.input.value = null;
      this.onChange?.(v);
      this.changeDetectorRef.markForCheck();

      return;
    }

    const date = DateTime.fromISO(v).startOf('day');
    if (this._value !== date) {
      this._value = date;
      this.focus = date;
      this.input.value = date.setLocale('en-us').toLocaleString(DateTime.DATE_MED); // TODO: use globally defined locale
      this.onChange?.(v);
      this.changeDetectorRef.markForCheck();
    }
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-datepicker': true
    };

    ret[`x-datepicker-${this.color}`] = true;
    ret[`x-datepicker-${this.size}`] = true;
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

  getDay(index: number) {
    return this.focus
      .startOf('month')
      .startOf('week')
      .plus({ days: index - 1 });
  }

  isSelected(index: number) {
    return this._value?.toISODate() === this.getDay(index).toISODate();
  }

  isOutsideOfMonth(index: number) {
    const day = this.getDay(index);
    return day < this.focus.startOf('month') || day > this.focus.endOf('month');
  }

  updateMonth(add: boolean) {
    this.focus = this.focus.plus({ month: add ? 1 : -1 });
  }

  onClick(index: number) {
    const day = this.getDay(index);
    if (this.disabledDate?.(day)) {
      return;
    }

    this.value = day.toISODate();
    this.close();
  }

  writeValue(source: string) {
    this.value = source;
  }

  registerOnChange(onChange: (source: string | null) => void) {
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

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  private _keyPress(event: KeyboardEvent) {
    event?.preventDefault();
    this.open();
  }

  isFocused(index: number) {
    return this.focus.toISODate() === this.getDay(index).toISODate();
  }

  focusMove(days: number) {
    const day = this.focus.plus({ days });
    if (this.disabledDate?.(day)) {
      return;
    }

    this.focus = day;
  }

  applyFocused() {
    this.value = this.focus.toISODate();
    this.close();
  }

  open() {
    this.focus = this._value ?? DateTime.now().startOf('day');
    this.isOpen = !this.readOnly && !this.disabled;
  }

  private close() {
    this.isOpen = false;
    this.isFocus = false;
  }
}
