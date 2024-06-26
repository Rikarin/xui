import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  input,
  model,
  Optional,
  Self,
  signal
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { INPUT_GROUP_ACCESSOR, InputColor, InputGroupAccessor, InputSize, InputType } from './input.types';
import { INPUT_MODULE, XuiConfigService } from '../config';

@Component({
  selector: 'xui-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'input.html',
  host: {
    '(focusout)': '_onTouched?.()'
  }
})
export class XuiInput implements ControlValueAccessor {
  private readonly _moduleName = INPUT_MODULE;

  private onChange?: (source: string | null) => void;
  _onTouched?: () => void;
  _disabled = signal(false);

  value = model<string>();
  placeholder = input<string>();
  color = input<InputColor>('light');
  size = input<InputSize>('large');
  type = input<InputType>('text');
  dataList = input<string[] | null>();
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });
  readOnly = input(false, { transform: booleanAttribute });

  _styles = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-input': true,
      'x-input-error': this._showError
    };

    ret[`x-input-${this.color()}`] = true;
    ret[`x-input-${this.group?.size() ?? this.size()}`] = true;
    return ret;
  });

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private configService: XuiConfigService,
    private translation: TranslateService,
    @Inject(INPUT_GROUP_ACCESSOR) @Optional() private group: InputGroupAccessor,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    effect(() => this.disabled() && this._disabled.set(this.disabled()!), { allowSignalWrites: true });
    effect(() => this.value() != undefined && this.onChange?.(this.value()!));
  }

  get _showError(): boolean {
    if (!this.control) {
      return false;
    }

    const invalid = !!this.control.invalid;
    const { dirty, touched } = this.control;
    return invalid ? (dirty ?? false) || (touched ?? false) : false;
  }

  writeValue(source: string) {
    this.value.set(source);
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
}
