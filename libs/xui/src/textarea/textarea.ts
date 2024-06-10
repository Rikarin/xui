import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  Optional,
  Self,
  signal
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TextareaColor, TextareaSize } from './textarea.types';
import { CommonModule } from '@angular/common';
import { XuiFocusModule } from '../utils/focus.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, XuiFocusModule],
  selector: 'xui-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'textarea.html',
  host: {
    '(focusout)': '_onTouched?.()'
  }
})
export class XuiTextarea implements ControlValueAccessor {
  private onChange?: (source: string | null) => void;
  _onTouched?: () => void;
  _disabled = signal(false);

  value = model<string>();
  placeholder = input<string>();
  color = input<TextareaColor>('light');
  size = input<TextareaSize>('normal');
  rows = input(3);
  maxLength = input<number>();
  disabled = input<boolean | undefined, string | boolean>(undefined, {
    transform: booleanAttribute
  });
  readOnly = input(false, { transform: booleanAttribute });

  _worldCount = computed(() => ((this.maxLength() as number) ?? 0) - (this.value()?.length ?? 0));
  _styles = computed(() => {
    const ret: { [klass: string]: boolean } = {
      'x-textarea': true,
      'x-textarea-disabled': this._disabled()
    };

    ret[`x-textarea-${this.color()}`] = true;
    return ret;
  });

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private translation: TranslateService,
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
