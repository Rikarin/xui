import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  Input,
  Optional,
  Self,
  signal
} from '@angular/core';
import { DateTime } from 'luxon';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { convertToBoolean } from '../utils';
import { XuiInputModule } from '../input';
import { DatePickerColor, DatePickerSize } from './date-picker.types';
import { DATE_PICKER_MODULE, XuiConfigService } from '../config';
import { CommonModule } from '@angular/common';
import { XuiIcon } from '../icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  standalone: true,
  imports: [CommonModule, XuiIcon, XuiInputModule, OverlayModule, A11yModule, ReactiveFormsModule],
  selector: 'xui-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'date-picker.html',
  host: {
    '(focusout)': '_onTouched?.()',
    '(keydown.enter)': '_keyPress($event)',
    '(keydown.space)': '_keyPress($event)'
  }
})
export class XuiDatePicker implements ControlValueAccessor {
  private readonly _moduleName = DATE_PICKER_MODULE;
  readonly _indices = Array.from(Array(7 * 6)).map((x, i) => i);

  private onChange?: (source: string | null) => void;
  _onTouched?: () => void;

  _value = signal<DateTime | null>(null);
  _focused = signal<DateTime>(DateTime.now().startOf('day'));
  _isOpened = signal(false);
  _hasFocus = signal(false);
  _mouseDown = signal(false);
  _disabled = signal(false);

  @Input() disabledDate?: (current: DateTime) => boolean;
  value = input<string | null>();
  placeholder = input<string>();
  color = input<DatePickerColor>('light');
  size = input<DatePickerSize>('large');
  disabled = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });
  readOnly = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });
  allowClear = input(false, { transform: (v: string | boolean) => convertToBoolean(v) });

  _styles = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-datepicker': true
    };

    ret[`x-datepicker-${this.color()}`] = true;
    ret[`x-datepicker-${this.size()}`] = true;

    return ret;
  });

  constructor(
    private configService: XuiConfigService,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this._disabled.set(this.disabled()), { allowSignalWrites: true });
    effect(
      () => {
        this.onChange?.(this._value()?.toISODate() ?? null);
        this._focused.set(this._value()! ?? DateTime.now().startOf('day'));
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        if (this.value()) {
          this._value.set(DateTime.fromISO(this.value()!).startOf('day'));
        }
      },
      { allowSignalWrites: true }
    );
  }

  _getDay(index: number) {
    return this._focused()
      .startOf('month')
      .startOf('week')
      .plus({ days: index - 1 });
  }

  _isSelected(index: number) {
    return this._value()?.toISODate() === this._getDay(index).toISODate();
  }

  _isOutsideOfMonth(index: number) {
    const day = this._getDay(index);
    return day < this._focused().startOf('month') || day > this._focused().endOf('month');
  }

  _updateMonth(add: boolean) {
    this._focused.set(this._focused().plus({ month: add ? 1 : -1 }));
  }

  _onClick(index: number) {
    const day = this._getDay(index);
    if (this.disabledDate?.(day)) {
      return;
    }

    this._value.set(day);
    this.close();
  }

  writeValue(source: string) {
    this._value.set(DateTime.fromISO(source).startOf('day'));
  }

  registerOnChange(onChange: (source: string | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this._onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  _keyPress(event: KeyboardEvent) {
    event?.preventDefault();
    this.open();
  }

  _isFocused(index: number) {
    return this._focused().toISODate() === this._getDay(index).toISODate();
  }

  _focusMove(days: number) {
    const day = this._focused().plus({ days });
    if (this.disabledDate?.(day)) {
      return;
    }

    this._focused.set(day);
  }

  _applyFocused() {
    this._value.set(this._focused());
    this.close();
  }

  open() {
    this._focused.set(this._value() ?? DateTime.now().startOf('day'));
    this._isOpened.set(!this.readOnly() && !this._disabled());
  }

  private close() {
    this._isOpened.set(false);
    this._hasFocus.set(false);
  }
}
