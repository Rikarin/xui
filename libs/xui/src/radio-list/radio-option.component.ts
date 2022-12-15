import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { RadioListService } from './radio-list.service';
import { InputBoolean } from '../utils';
import { XuiRadioListComponent } from './radio-list.component';
import { BooleanInput } from '@angular/cdk/coercion';

@Component({
  selector: 'xui-radio-option',
  exportAs: 'xuiRadioOption',
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
export class XuiRadioOptionComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_disabled: BooleanInput;

  @Input() color?: string;
  @Input() value!: string;
  @Input() description?: string;
  @Input() @InputBoolean() disabled = false;

  private isSelected = false;
  private isFocused = false;

  get isDisabled() {
    return this.disabled || this.radioList.disabled;
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
    ret[`x-radio-option-background-${this.radioList.color}`] = true;
    ret[`x-radio-option-${this.radioList.size}`] = true;
    return ret;
  }

  constructor(
    private radioList: XuiRadioListComponent,
    private radioListService: RadioListService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.radioListService.addOption(this);
  }

  ngOnDestroy() {
    this.radioListService.removeOption(this);
  }

  @HostListener('click')
  click() {
    if (!this.isDisabled) {
      this.radioListService.select(this.value);
    }
  }

  focus(value: boolean) {
    this.isFocused = value;
    this.changeDetectorRef.markForCheck();
  }

  select(value: boolean) {
    this.isSelected = value;
    this.changeDetectorRef.markForCheck();
  }
}
