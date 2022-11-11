import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Optional,
  Self,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { inNextTick, InputBoolean } from '../utils';
import { SelectService } from './select.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { XuiOptionComponent } from './option.component';

@UntilDestroy()
@Component({
  selector: 'xui-select',
  exportAs: 'xuiSelect',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'select.component.html',
  providers: [SelectService]
})
export class XuiSelectComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  _value?: string;
  touched = false;
  onChange = (source?: string) => {};
  onTouched = () => {};

  isOpen = false;
  selectedOption: XuiOptionComponent | null = null;

  @Input() placeholder?: string;
  @Input() @InputBoolean() disabled: boolean = false;
  @Input() color: 'light' | 'dark' = 'light';
  // @Input() size: 'normal' | 'small' = 'normal';

  @Input()
  get value() {
    return this._value;
  }

  set value(v) {
    if (this._value !== v) {
      this._value = v;
      this.onChange(v);
      this.selectService.select(v!);
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
    return `xui-select xui-select-${this.color} ${this.disabled ? 'xui-select-disabled' : ''}`;
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
      this.value = option?.value;
      this.selectedOption = option;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit() {
    this.control?.statusChanges!.subscribe(() => {
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

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
