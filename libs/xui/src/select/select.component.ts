import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { inNextTick, InputBoolean } from '../utils';
import { SelectService } from './select.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { XuiOptionComponent } from './option.component';
import { SelectColor, SelectSize } from './select.types';
import { BooleanInput } from '@angular/cdk/coercion';

@UntilDestroy()
@Component({
  selector: 'xui-select',
  exportAs: 'xuiSelect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'select.component.html',
  providers: [SelectService]
})
export class XuiSelectComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  static ngAcceptInputType_disabled: BooleanInput;

  private onChange?: (source: string | null) => void;
  private onTouched?: () => void;

  _value: string | null = null;
  touched = false;

  isOpen = false;
  selectedOption: XuiOptionComponent | null = null;

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled = false;
  @Input() color: SelectColor = 'light';
  @Input() size: SelectSize = 'large';

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange?.(v);
      this.selectService.select(v);
      this.changeDetectorRef.markForCheck();
    }
  }

  get width() {
    return this.elementRef.nativeElement.offsetWidth;
  }

  get viewValue() {
    return this.selectedOption?.viewValue;
  }

  get styles() {
    const ret: { [klass: string]: boolean } = {
      'x-select': true,
      'x-select-disabled': this.disabled
    };

    ret[`x-select-${this.color}`] = true;
    ret[`x-select-${this.size}`] = true;
    return ret;
  }

  get errorMessage() {
    const msg = this.control?.getError('message');
    return this.translation.instant(msg);
  }

  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private translation: TranslateService,
    private selectService: SelectService,
    @Self() @Optional() public control?: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }

    selectService.selected$.pipe(untilDestroyed(this)).subscribe(option => {
      this.isOpen = false;
      this.value = option?.value ?? null;
      this.selectedOption = option;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit() {
    this.control?.statusChanges?.subscribe(() => {
      this.selectService.select(this.value!);
      this.changeDetectorRef.markForCheck();
    });
  }

  async ngAfterViewInit() {
    await inNextTick();
    this.selectService.select(this.value!);
  }

  open() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  writeValue(source: string) {
    this.value = source;
  }

  registerOnChange(onChange: (source: string | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched?.();
      this.touched = true;
    }
  }
}

@Component({
  selector: 'xui-select-options',
  exportAs: 'xuiSelectOptions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`
})
export class SelectOptionsComponent {}
