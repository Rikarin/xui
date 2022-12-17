import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  HostListener,
  Input,
  OnInit,
  Optional,
  QueryList,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  RADIO_LIST_ACCESSOR,
  RadioListAccessor,
  RadioListColor,
  RadioListSize,
  RadioListValue
} from './radio-list.types';
import { BooleanInput } from '@angular/cdk/coercion';
import { InputBoolean } from '../utils';
import { RadioOptionComponent } from './radio-option.component';
import { OptionComponent } from '../select';

@Component({
  selector: 'xui-radio-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="x-radio-list" tabindex="0"><ng-content></ng-content></div>',
  providers: [{ provide: RADIO_LIST_ACCESSOR, useExisting: RadioListComponent }]
})
export class RadioListComponent implements RadioListAccessor, ControlValueAccessor, OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: RadioListValue) => void;
  private onTouched?: () => void;
  private _mouseDown = false;
  private _value: RadioListValue = null;

  @Input() size: RadioListSize = 'md';
  @Input() color: RadioListColor = 'light';
  @Input() @InputBoolean() disabled = false;

  @ContentChildren(RadioOptionComponent) optionsRef!: QueryList<OptionComponent>;

  focusedValue?: RadioListValue;
  onChange$ = new Subject();

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

  constructor(private cdr: ChangeDetectorRef, @Self() @Optional() public control?: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => this.cdr.markForCheck());
  }

  writeValue(source: RadioListValue) {
    this.value = source;
  }

  registerOnChange(onChange: (source: RadioListValue) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener('keydown.arrowup', ['$event'])
  private prev(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.select(true);
  }

  @HostListener('keydown.arrowdown', ['$event'])
  private next(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.select(false);
  }

  @HostListener('mousedown')
  private mouseDown() {
    this._mouseDown = true;
  }

  @HostListener('mouseup')
  private mouseUp() {
    this._mouseDown = false;
  }

  @HostListener('focusin')
  private focus() {
    if (!this._mouseDown) {
      this.focusedValue = this.value;
      this.onChange$.next(null);
    }
  }

  @HostListener('focusout')
  private focusout() {
    this.focusedValue = undefined;
    this.onChange$.next(null);
    this.onTouched?.();
  }

  private select(prev: boolean) {
    if (this.disabled) {
      return;
    }

    const options = this.optionsRef.toArray();
    let next = options.findIndex(x => x.value === this.value);
    let iteration = 0;

    do {
      next += prev ? -1 : 1;

      if (prev && next < 0) {
        next = options.length - 1;
        iteration++;
      } else if (!prev && next >= options.length) {
        next = 0;
        iteration++;
      }

      if (iteration == 2) {
        return;
      }
    } while (options[next].disabled);

    this.value = options[next].value;
    this.focusedValue = this.value;
  }
}
