import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnInit
} from '@angular/core';
import { InputBoolean } from '../utils';
import { BooleanInput } from '@angular/cdk/coercion';
import { RADIO_LIST_ACCESSOR, RadioListAccessor } from './radio-list.types';

@Component({
  selector: 'xui-radio-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles">
    <xui-icon>{{ icon }}</xui-icon>
    <div class="x-radio-option-content">
      <ng-content></ng-content>
      <div class="x-radio-option-description">
        <ng-content select="[xuiDescription]"></ng-content>
      </div>
    </div>
  </div>`
})
export class RadioOptionComponent implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() color?: string;
  @Input() value!: string;
  @Input() description?: string;
  @Input() @InputBoolean() disabled = false;

  get isSelected() {
    return this.value === this.list.value;
  }

  get isFocused() {
    return this.value === this.list.focusedValue;
  }

  get isDisabled() {
    return this.disabled || this.list.disabled;
  }

  get icon() {
    return this.isSelected ? 'radiobox-marked' : 'radiobox-blank';
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-radio-option': true,
      'x-radio-option-focus': this.isFocused,
      'x-radio-option-active': this.isSelected,
      'x-radio-option-disabled': this.isDisabled
    };

    ret[`x-radio-option-${this.color}`] = !!this.color;
    ret[`x-radio-option-background-${this.list.color}`] = true;
    ret[`x-radio-option-${this.list.size}`] = true;
    return ret;
  }

  constructor(
    @Inject(RADIO_LIST_ACCESSOR) private list: RadioListAccessor,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.list.onChange$.subscribe(() => this.cdr.markForCheck());
  }

  @HostListener('click')
  click() {
    if (!this.isDisabled) {
      this.list.value = this.value;
    }
  }
}
