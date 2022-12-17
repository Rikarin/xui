import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnInit
} from '@angular/core';
import { RADIO_GROUP_ACCESSOR, RadioColor, RadioGroupAccessor, RadioValue } from './radio.types';
import { BooleanInput } from '@angular/cdk/coercion';
import { InputBoolean } from '../utils';

@Component({
  selector: 'xui-radio',
  templateUrl: './radio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() @InputBoolean() disabled = false;
  @Input() value: RadioValue = null;
  @Input() color?: RadioColor;

  get selected() {
    return this.group.value === this.value;
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-radio': true,
      // 'x-select-option-selected': this.isSelected,
      'x-radio-disabled': this.disabled
    };

    ret[`x-radio-${this.color ?? this.group.color}`] = true;
    return ret;
  }

  constructor(
    @Inject(RADIO_GROUP_ACCESSOR) private group: RadioGroupAccessor,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.group.onChange$.subscribe(() => this.changeDetectorRef.markForCheck());
  }

  @HostListener('click')
  private _click() {
    if (!this.disabled) {
      this.group.value = this.value;
    }
  }
}
