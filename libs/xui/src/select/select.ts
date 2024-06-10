import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  Optional,
  Self,
  signal
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { XUI_SELECT_ACCESSOR, SelectAccessor, SelectColor, SelectItem, SelectSize, SelectValue } from './select.types';

@UntilDestroy()
@Component({
  selector: 'xui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'select.html',
  providers: [{ provide: XUI_SELECT_ACCESSOR, useExisting: XuiSelect }],
  host: {
    '(focusout)': '_onTouched?.()'
  }
})
export class XuiSelect implements SelectAccessor, ControlValueAccessor {
  private onChange?: (source: SelectValue) => void;
  _onTouched?: () => void;

  _viewValue = signal('');
  _isOpened = signal(false);
  _disabled = signal(false);

  value = model<SelectValue>(null);
  placeholder = input<string>();
  color = input<SelectColor>('light');
  size = input<SelectSize>('large');
  items = input<SelectItem[]>();
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });

  _styles = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-select': true,
      'x-select-disabled': this._disabled()
    };

    ret[`x-select-${this.color()}`] = true;
    ret[`x-select-${this.size()}`] = true;
    return ret;
  });

  get _width() {
    return this.elementRef.nativeElement.offsetWidth;
  }

  constructor(
    private elementRef: ElementRef,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.value() != undefined && this.onChange?.(this.value()!));
  }

  open() {
    this._isOpened.set(!this._disabled());
  }

  close() {
    this._isOpened.set(false);
  }

  writeValue(source: SelectValue) {
    this.value.set(source);
  }

  registerOnChange(onChange: (source: SelectValue) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this._onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
