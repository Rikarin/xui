import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
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
  template: `<xui-icon [icon]="icon"></xui-icon>
    <div class="x-radio-option-content">
      <ng-content />

      <div class="x-radio-option-description">
        <ng-content select="[xuiDescription]" />
      </div>
    </div>`
})
export class XuiRadioOption implements OnInit {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() color?: string;
  @Input() value!: string;
  @Input() description?: string;
  @Input() @InputBoolean() disabled = false;

  @HostBinding('class.x-radio-option')
  get hostMainClass(): boolean {
    return true;
  }

  @HostBinding('class.x-radio-option-focus')
  get hostFocusClass(): boolean {
    return this.isFocused;
  }

  @HostBinding('class.x-radio-option-active')
  get hostActiveClass(): boolean {
    return this.isSelected;
  }

  @HostBinding('class.x-radio-option-disabled')
  get hostDisabledClass(): boolean {
    return this.isDisabled;
  }

  @HostBinding('class')
  get hostClass(): string {
    return `${this.color ? 'x-radio-option-' + this.color : ''} x-radio-option-background-${
      this.list.color
    } x-radio-option-${this.list.size}`;
  }

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
    return this.isSelected ? 'radio_button_checked' : 'radio_button_unchecked';
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
