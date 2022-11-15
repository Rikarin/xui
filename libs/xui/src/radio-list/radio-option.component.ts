import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { RadioListService } from './radio-list.service';
import { InputBoolean } from '../utils';
import { XuiRadioListComponent } from './radio-list.component';

@Component({
  selector: 'xui-radio-option',
  exportAs: 'xuiRadioOption',
  styleUrls: ['radio-list-options.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [ngClass]="styles">
    <xui-icon>{{ icon }}</xui-icon>
    <div class="radio-option-content">
      <ng-content></ng-content>
      <div class="radio-option-description">
        <ng-content select="[xuiDescription]"></ng-content>
      </div>
    </div>
  </div>`
})
export class XuiRadioOptionComponent implements OnInit, OnDestroy {
  @Input() color?: string;
  @Input() value!: string;
  @Input() description?: string;
  @Input() @InputBoolean() disabled = false;

  private isSelected = false;
  private isFocused = false;

  get icon() {
    return this.isSelected ? 'radiobox-marked' : 'radiobox-blank';
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'radio-option': true,
      'radio-option-focus': this.isFocused,
      'radio-option-active': this.isSelected,
      'radio-option-disabled': this.disabled
    };

    ret[`radio-option-color-${this.color}`] = !!this.color;
    ret[`radio-option-background-color-${this.radioList.color}`] = true;
    ret[`radio-option-size-${this.radioList.size}`] = true;
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
    if (!this.disabled) {
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
